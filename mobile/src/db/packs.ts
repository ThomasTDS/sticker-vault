import type { SQLiteDatabase } from 'expo-sqlite';

// Limits defined by WhatsApp for third-party sticker packs.
export const PACK_NAME_MAX_LENGTH = 128;
export const PACK_PUBLISHER_MAX_LENGTH = 128;
export const PACK_MIN_STICKERS = 3;
export const PACK_MAX_STICKERS = 30;
export const STICKER_MAX_EMOJIS = 3;

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
  emojis: string[];
  tags: string[];
  favorite: boolean;
  useCount: number;
};

export type StickerSearchResult = Sticker & { packName: string };

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
  emojis: string;
  tags: string;
  favorite: number;
  use_count: number;
};

type StickerWithPackRow = StickerRow & { pack_name: string };

const STICKER_COLUMNS = 'id, pack_id, file_uri, created_at, emojis, tags, favorite, use_count';

const STICKER_WITH_PACK_SELECT = `
  SELECT s.id, s.pack_id, s.file_uri, s.created_at, s.emojis, s.tags, s.favorite, s.use_count, p.name AS pack_name
  FROM stickers s JOIN packs p ON p.id = s.pack_id
`;

export const HOME_SECTION_LIMIT = 10;

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
  return {
    id: row.id,
    packId: row.pack_id,
    fileUri: row.file_uri,
    createdAt: row.created_at,
    emojis: JSON.parse(row.emojis),
    tags: JSON.parse(row.tags),
    favorite: row.favorite === 1,
    useCount: row.use_count,
  };
}

function toSearchResult(row: StickerWithPackRow): StickerSearchResult {
  return { ...toSticker(row), packName: row.pack_name };
}

// Lowercase and without accents, so "Bom Dia" matches "bom dia" and "reação" matches "reacao".
export function normalizeSearchText(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function parseTags(text: string) {
  const tags = text
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
  return [...new Set(tags)];
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
    `SELECT ${STICKER_COLUMNS} FROM stickers WHERE pack_id = ? ORDER BY id`,
    packId,
  );
  return rows.map(toSticker);
}

export async function getSticker(db: SQLiteDatabase, id: number): Promise<Sticker | null> {
  const row = await db.getFirstAsync<StickerRow>(`SELECT ${STICKER_COLUMNS} FROM stickers WHERE id = ?`, id);
  return row ? toSticker(row) : null;
}

export async function updateStickerDetails(db: SQLiteDatabase, id: number, emojis: string[], tags: string[]) {
  await db.runAsync(
    'UPDATE stickers SET emojis = ?, tags = ? WHERE id = ?',
    JSON.stringify(emojis.slice(0, STICKER_MAX_EMOJIS)),
    JSON.stringify(tags),
    id,
  );
}

// Matches the query against the sticker emojis, its tags and the name of its pack.
export async function searchStickers(db: SQLiteDatabase, query: string): Promise<StickerSearchResult[]> {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length === 0) {
    return [];
  }

  const rows = await db.getAllAsync<StickerWithPackRow>(`${STICKER_WITH_PACK_SELECT} ORDER BY p.created_at DESC, s.id`);

  return rows
    .map(toSearchResult)
    .filter(
      (sticker) =>
        sticker.emojis.some((emoji) => normalizedQuery.includes(emoji)) ||
        sticker.tags.some((tag) => normalizeSearchText(tag).includes(normalizedQuery)) ||
        normalizeSearchText(sticker.packName).includes(normalizedQuery),
    );
}

export async function addSticker(db: SQLiteDatabase, packId: number, fileUri: string): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO stickers (pack_id, file_uri, created_at) VALUES (?, ?, ?)',
    packId,
    fileUri,
    Date.now(),
  );
  return result.lastInsertRowId;
}

export async function deleteSticker(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM stickers WHERE id = ?', id);
}

export async function setStickerFavorite(db: SQLiteDatabase, id: number, favorite: boolean) {
  await db.runAsync('UPDATE stickers SET favorite = ? WHERE id = ?', favorite ? 1 : 0, id);
}

export async function registerStickerUse(db: SQLiteDatabase, id: number) {
  await db.runAsync('UPDATE stickers SET use_count = use_count + 1, last_used_at = ? WHERE id = ?', Date.now(), id);
}

export async function listFavoriteStickers(db: SQLiteDatabase): Promise<StickerSearchResult[]> {
  const rows = await db.getAllAsync<StickerWithPackRow>(
    `${STICKER_WITH_PACK_SELECT} WHERE s.favorite = 1 ORDER BY s.id DESC LIMIT ?`,
    HOME_SECTION_LIMIT,
  );
  return rows.map(toSearchResult);
}

export async function listMostUsedStickers(db: SQLiteDatabase): Promise<StickerSearchResult[]> {
  const rows = await db.getAllAsync<StickerWithPackRow>(
    `${STICKER_WITH_PACK_SELECT} WHERE s.use_count > 0 ORDER BY s.use_count DESC, s.last_used_at DESC LIMIT ?`,
    HOME_SECTION_LIMIT,
  );
  return rows.map(toSearchResult);
}
