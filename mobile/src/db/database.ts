import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'sticker-vault.db';

const DATABASE_VERSION = 2;

export async function migrateDatabase(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  await db.execAsync('PRAGMA foreign_keys = ON;');

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE packs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        publisher TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE stickers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pack_id INTEGER NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
        file_uri TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX idx_stickers_pack_id ON stickers(pack_id);
    `);
  }

  if (currentVersion < 2) {
    // Emojis and tags are stored as JSON arrays of strings.
    await db.execAsync(`
      ALTER TABLE stickers ADD COLUMN emojis TEXT NOT NULL DEFAULT '[]';
      ALTER TABLE stickers ADD COLUMN tags TEXT NOT NULL DEFAULT '[]';
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
