import { browser } from '@wdio/globals';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const APP_ID = 'com.thomastds.stickervault';

const FIXTURE_IMAGES = ['sticker-1.png', 'sticker-2.png', 'sticker-3.png'];
const GALLERY_DIR = '/sdcard/Pictures/StickerVaultE2E';

// Clears the app data (database and stickers) so every scenario starts from an empty vault.
export async function resetApp() {
  await browser.execute('mobile: clearApp', { appId: APP_ID });
  await browser.execute('mobile: activateApp', { appId: APP_ID });
}

// Copies the fixture images to the device gallery, making them the most recent photos.
// On Android 11+ shared storage is indexed by MediaProvider as soon as the file is written.
export async function pushGalleryImages() {
  for (const name of FIXTURE_IMAGES) {
    const content = await readFile(path.resolve(import.meta.dirname, '../fixtures/images', name));
    await browser.pushFile(`${GALLERY_DIR}/${name}`, content.toString('base64'));
  }
}
