import { browser } from '@wdio/globals';
import { strToU8, zipSync } from 'fflate';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const DOWNLOAD_DIR = '/sdcard/Download';
const FIXTURE_IMAGES = ['sticker-1.png', 'sticker-2.png', 'sticker-3.png'];

// Builds a drawer file in the same format the app exports (manifest.json + one image per sticker).
export async function buildPackFile(name: string, emojisOfFirstSticker: string[]) {
  const entries: Record<string, Uint8Array> = {};
  const stickers = [];
  for (const [index, image] of FIXTURE_IMAGES.entries()) {
    const file = `stickers/${index + 1}.png`;
    entries[file] = await readFile(path.resolve(import.meta.dirname, '../fixtures/images', image));
    stickers.push({ file, emojis: index === 0 ? emojisOfFirstSticker : [], tags: ['amigos'] });
  }
  entries['manifest.json'] = strToU8(
    JSON.stringify({ format: 'sticker-vault-pack', version: 1, name, publisher: 'Turma', stickers }),
  );
  return zipSync(entries, { level: 0 });
}

export async function pushToDownloads(fileName: string, content: Uint8Array) {
  await browser.pushFile(`${DOWNLOAD_DIR}/${fileName}`, Buffer.from(content).toString('base64'));
}
