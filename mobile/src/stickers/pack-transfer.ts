import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { SQLiteDatabase } from 'expo-sqlite';
import { strToU8, unzipSync, zipSync } from 'fflate';

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
import {
  asStrings,
  fileSafeName,
  isAnimatedSticker,
  MANIFEST_NAME,
  PACK_FILE_FORMAT,
  PACK_FILE_VERSION,
  PackFileError,
  readManifest,
  type PackManifest,
} from '@/stickers/pack-manifest';
import {
  ANIMATED_STICKER_MAX_BYTES,
  createStickerFileFromUri,
  deletePackFiles,
  storeAnimatedStickerFile,
} from '@/stickers/sticker-files';

// A shared drawer is a zip file with a manifest.json and one image per sticker (see pack-manifest.ts).
export const PACK_FILE_EXTENSION = '.stickervault';
const MAX_IMPORT_BYTES = 15 * 1024 * 1024;

export { PackFileError };

export type ImportResult = { packId: number; imported: number; skipped: number };

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
    animated: pack.animated,
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

// Images from a shared file are never trusted as they are: static ones are re-encoded as WhatsApp stickers,
// and animated ones (which re-encoding would flatten) must pass the animated sticker header and size check.
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
  const animated = manifest.animated === true;
  const packId = await createPack(
    db,
    manifest.name.trim().slice(0, PACK_NAME_MAX_LENGTH),
    publisher.trim().slice(0, PACK_PUBLISHER_MAX_LENGTH),
    animated,
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
      let fileUri: string;
      if (animated) {
        if (!isAnimatedSticker(data, ANIMATED_STICKER_MAX_BYTES)) {
          throw new PackFileError('invalid-file');
        }
        fileUri = await storeAnimatedStickerFile(packId, data);
      } else {
        temp.create();
        await temp.write(data);
        fileUri = await createStickerFileFromUri(packId, temp.uri);
      }
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
