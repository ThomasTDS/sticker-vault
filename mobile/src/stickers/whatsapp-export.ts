import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { SQLiteDatabase } from 'expo-sqlite';

import { addStickerPack } from '../../modules/whatsapp-stickers';
import { listPacks, listStickers, PACK_MIN_STICKERS, type Sticker } from '@/db/packs';

// WhatsApp requires 1 to 3 emojis per sticker; the default covers stickers without a chosen emoji.
const DEFAULT_EMOJIS = ['😀'];
const TRAY_ICON_SIZE = 96;
const TRAY_ICON_FILE = 'tray.png';

const stickersRoot = () => new Directory(Paths.document, 'stickers');

function fileName(uri: string) {
  return uri.substring(uri.lastIndexOf('/') + 1);
}

// The tray icon is a 96x96 PNG generated from the pack's first sticker.
async function writeTrayIcon(packId: number, firstSticker: Sticker) {
  const rendered = await ImageManipulator.manipulate(firstSticker.fileUri)
    .resize({ width: TRAY_ICON_SIZE, height: TRAY_ICON_SIZE })
    .renderAsync();
  const result = await rendered.saveAsync({ format: SaveFormat.PNG });

  const destination = new File(stickersRoot(), String(packId), TRAY_ICON_FILE);
  if (destination.exists) {
    destination.delete();
  }
  new File(result.uri).move(destination);
}

// Writes stickers/contents.json, read by the native content provider when WhatsApp loads a pack.
export async function exportPacksForWhatsApp(db: SQLiteDatabase) {
  const packs = (await listPacks(db)).filter((pack) => pack.stickerCount >= PACK_MIN_STICKERS);

  const entries = [];
  for (const pack of packs) {
    const stickers = await listStickers(db, pack.id);
    await writeTrayIcon(pack.id, stickers[0]);
    entries.push({
      identifier: String(pack.id),
      name: pack.name,
      publisher: pack.publisher,
      tray_image_file: TRAY_ICON_FILE,
      image_data_version: `${stickers.length}-${stickers[stickers.length - 1].id}`,
      avoid_cache: false,
      stickers: stickers.map((sticker) => ({
        image_file: fileName(sticker.fileUri),
        emojis: sticker.emojis.length > 0 ? sticker.emojis : DEFAULT_EMOJIS,
      })),
    });
  }

  const root = stickersRoot();
  root.create({ intermediates: true, idempotent: true });
  const contents = new File(root, 'contents.json');
  if (contents.exists) {
    contents.delete();
  }
  contents.create();
  await contents.write(JSON.stringify({ sticker_packs: entries }));
}

export async function sendPackToWhatsApp(db: SQLiteDatabase, packId: number, packName: string) {
  await exportPacksForWhatsApp(db);
  return addStickerPack(String(packId), packName);
}
