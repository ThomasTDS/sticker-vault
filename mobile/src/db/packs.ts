import type { SQLiteDatabase } from 'expo-sqlite';

// Limits defined by WhatsApp for third-party sticker packs.
export const PACK_NAME_MAX_LENGTH = 128;
export const PACK_PUBLISHER_MAX_LENGTH = 128;
export const PACK_MIN_STICKERS = 3;
export const PACK_MAX_STICKERS = 30;

export type Pack = {
  id: number;
  name: string;
  publisher: string;
  createdAt: number;
  stickerCount: number;
};

export type Sticker = {
  id: number;
  packId: number;
  fileUri: string;
  createdAt: number;
};

type PackRow = {
  id: number;
  name: string;
  publisher: string;
  created_at: number;
  sticker_count: number;
};

type StickerRow = {
  id: number;
  pack_id: number;
  file_uri: string;
  created_at: number;
};

const PACK_SELECT = `
  SELECT p.id, p.name, p.publisher, p.created_at, COUNT(s.id) AS sticker_count
  FROM packs p
  LEFT JOIN stickers s ON s.pack_id = p.id
`;

function toPack(row: PackRow): Pack {
  return {
    id: row.id,
    name: row.name,
    publisher: row.publisher,
    createdAt: row.created_at,
    stickerCount: row.sticker_count,
  };
}

function toSticker(row: StickerRow): Sticker {
  return { id: row.id, packId: row.pack_id, fileUri: row.file_uri, createdAt: row.created_at };
}

export async function listPacks(db: SQLiteDatabase): Promise<Pack[]> {
  const rows = await db.getAllAsync<PackRow>(`${PACK_SELECT} GROUP BY p.id ORDER BY p.created_at DESC, p.id DESC`);
  return rows.map(toPack);
}

export async function getPack(db: SQLiteDatabase, id: number): Promise<Pack | null> {
  const row = await db.getFirstAsync<PackRow>(`${PACK_SELECT} WHERE p.id = ? GROUP BY p.id`, id);
  return row ? toPack(row) : null;
}

export async function createPack(db: SQLiteDatabase, name: string, publisher: string): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO packs (name, publisher, created_at) VALUES (?, ?, ?)',
    name.trim(),
    publisher.trim(),
    Date.now(),
  );
  return result.lastInsertRowId;
}

export async function deletePack(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM packs WHERE id = ?', id);
}

export async function listStickers(db: SQLiteDatabase, packId: number): Promise<Sticker[]> {
  const rows = await db.getAllAsync<StickerRow>(
    'SELECT id, pack_id, file_uri, created_at FROM stickers WHERE pack_id = ? ORDER BY id',
    packId,
  );
  return rows.map(toSticker);
}

export async function addSticker(db: SQLiteDatabase, packId: number, fileUri: string): Promise<void> {
  await db.runAsync(
    'INSERT INTO stickers (pack_id, file_uri, created_at) VALUES (?, ?, ?)',
    packId,
    fileUri,
    Date.now(),
  );
}

export async function deleteSticker(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM stickers WHERE id = ?', id);
}
