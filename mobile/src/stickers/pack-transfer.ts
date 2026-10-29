import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { SQLiteDatabase } from 'expo-sqlite';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

import {
  addSticker,
  createPack,
  deletePack,
  getPack,
  listStickers,
  PACK_MAX_STICKERS,
  PACK_NAME_MAX_LENGTH,
  PACK_PUBLISHER_MAX_LENGTH,
  STICKER_MAX_EMOJIS,
  updateStickerDetails,
} from '@/db/packs';
import { createStickerFileFromUri, deletePackFiles } from '@/stickers/sticker-files';

// A shared drawer is a zip file with a manifest.json and one image per sticker.
export const PACK_FILE_EXTENSION = '.stickervault';
const PACK_FILE_FORMAT = 'sticker-vault-pack';
const PACK_FILE_VERSION = 1;
const MANIFEST_NAME = 'manifest.json';
const MAX_IMPORT_BYTES = 15 * 1024 * 1024;

type PackManifest = {
  format: typeof PACK_FILE_FORMAT;
  version: number;
  name: string;
  publisher: string;
  stickers: { file: string; emojis: string[]; tags: string[] }[];
};

export type ImportResult = { packId: number; imported: number; skipped: number };

export class PackFileError extends Error {
  constructor(public readonly reason: 'invalid-file' | 'no-stickers') {
    super(reason);
  }
}

function fileSafeName(name: string) {
  return (
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^\w-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'gaveta'
  );
}

const asStrings = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

export async function exportPack(db: SQLiteDatabase, packId: number): Promise<string> {
  const pack = await getPack(db, packId);
  if (!pack) {
    throw new PackFileError('invalid-file');
  }
  const stickers = await listStickers(db, packId);

  const manifest: PackManifest = {
    format: PACK_FILE_FORMAT,
    version: PACK_FILE_VERSION,
    name: pack.name,
    publisher: pack.publisher,
    stickers: stickers.map((sticker, index) => ({
      file: `stickers/${index + 1}.webp`,
      emojis: sticker.emojis,
      tags: sticker.tags,
    })),
  };

  const entries: Record<string, Uint8Array> = { [MANIFEST_NAME]: strToU8(JSON.stringify(manifest)) };
  for (const [index, sticker] of stickers.entries()) {
    entries[manifest.stickers[index].file] = await new File(sticker.fileUri).bytes();
  }

  // WebP is already compressed, so the entries are only stored.
  const output = new File(Paths.cache, `${fileSafeName(pack.name)}${PACK_FILE_EXTENSION}`);
  if (output.exists) {
    output.delete();
  }
  output.create();
  await output.write(zipSync(entries, { level: 0 }));
  return output.uri;
}

export async function sharePack(db: SQLiteDatabase, packId: number) {
  const uri = await exportPack(db, packId);
  await Sharing.shareAsync(uri, { mimeType: 'application/octet-stream', dialogTitle: 'Compartilhar gaveta' });
}

function readManifest(entries: Record<string, Uint8Array>): PackManifest {
  const raw = entries[MANIFEST_NAME];
  if (!raw) {
    throw new PackFileError('invalid-file');
  }
  const manifest = JSON.parse(strFromU8(raw));
  if (
    manifest?.format !== PACK_FILE_FORMAT ||
    typeof manifest.version !== 'number' ||
    manifest.version > PACK_FILE_VERSION ||
    typeof manifest.name !== 'string' ||
    manifest.name.trim().length === 0 ||
    !Array.isArray(manifest.stickers)
  ) {
    throw new PackFileError('invalid-file');
  }
  return manifest;
}

// Images from a shared file are never trusted as they are: each one is re-encoded as a WhatsApp sticker.
export async function importPackFromFile(db: SQLiteDatabase, file: File): Promise<ImportResult> {
  let entries: Record<string, Uint8Array>;
  let manifest: PackManifest;
  try {
    if ((file.size ?? 0) > MAX_IMPORT_BYTES) {
      throw new PackFileError('invalid-file');
    }
    entries = unzipSync(await file.bytes());
    manifest = readManifest(entries);
  } catch {
    throw new PackFileError('invalid-file');
  }

  const publisher = typeof manifest.publisher === 'string' && manifest.publisher.trim() ? manifest.publisher : '—';
  const packId = await createPack(
    db,
    manifest.name.trim().slice(0, PACK_NAME_MAX_LENGTH),
    publisher.trim().slice(0, PACK_PUBLISHER_MAX_LENGTH),
  );

  let imported = 0;
  let skipped = 0;
  for (const [index, entry] of manifest.stickers.slice(0, PACK_MAX_STICKERS).entries()) {
    const data = typeof entry?.file === 'string' ? entries[entry.file] : undefined;
    if (!data) {
      skipped++;
      continue;
    }
    const temp = new File(Paths.cache, `import-${Date.now()}-${index}`);
    try {
      temp.create();
      await temp.write(data);
      const fileUri = await createStickerFileFromUri(packId, temp.uri);
      const stickerId = await addSticker(db, packId, fileUri);
      await updateStickerDetails(
        db,
        stickerId,
        asStrings(entry.emojis).slice(0, STICKER_MAX_EMOJIS),
        asStrings(entry.tags),
      );
      imported++;
    } catch {
      skipped++;
    } finally {
      if (temp.exists) {
        temp.delete();
      }
    }
  }
  skipped += Math.max(manifest.stickers.length - PACK_MAX_STICKERS, 0);

  if (imported === 0) {
    await deletePack(db, packId);
    deletePackFiles(packId);
    throw new PackFileError('no-stickers');
  }
  return { packId, imported, skipped };
}

export async function pickAndImportPack(db: SQLiteDatabase): Promise<ImportResult | null> {
  const picked = await File.pickFileAsync({ mimeTypes: '*/*' });
  if (picked.canceled) {
    return null;
  }
  return importPackFromFile(db, picked.result);
}
