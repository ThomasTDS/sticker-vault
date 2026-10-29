import { browser } from '@wdio/globals';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const APP_ID = 'com.thomastds.stickervault';

const FIXTURE_IMAGES = ['sticker-1.png', 'sticker-2.png', 'sticker-3.png'];
const GALLERY_DIR = '/sdcard/Pictures/StickerVaultE2E';

// Values returned by Appium's queryAppState.
const APP_NOT_RUNNING = 1;
const APP_IN_FOREGROUND = 4;
const LAUNCH_ATTEMPTS = 3;

const appState = () => browser.execute('mobile: queryAppState', { appId: APP_ID }) as Promise<number>;

// Clears the app data (database and stickers) so every scenario starts from an empty vault.
// Right after the data is cleared Android may still be removing the old task and ignore the launch,
// so the reset waits for the app to stop and retries the launch until it is in the foreground.
export async function resetApp() {
  await browser.execute('mobile: clearApp', { appId: APP_ID });
  // Best effort: on slow devices the state may take a while to update; the launch below is what is verified.
  await browser
    .waitUntil(async () => (await appState()) === APP_NOT_RUNNING, { timeout: 20000 })
    .catch(() => undefined);

  for (let attempt = 1; attempt <= LAUNCH_ATTEMPTS; attempt++) {
    await browser.execute('mobile: activateApp', { appId: APP_ID });
    const launched = await browser
      .waitUntil(async () => (await appState()) === APP_IN_FOREGROUND, { timeout: 10000 })
      .catch(() => false);
    if (launched) {
      return;
    }
  }
  throw new Error(`The app did not come to the foreground after ${LAUNCH_ATTEMPTS} attempts`);
}

const FIXTURE_VIDEO = 'clip.mp4';
const VIDEOS_DIR = '/sdcard/Movies/StickerVaultE2E';

// Copies the fixture video to the device gallery three times (clip-1.mp4 to clip-3.mp4),
// so the photo picker lists them as the most recent videos.
export async function pushGalleryVideos() {
  const content = await readFile(path.resolve(import.meta.dirname, '../fixtures/videos', FIXTURE_VIDEO));
  for (let index = 1; index <= 3; index++) {
    const remotePath = `${VIDEOS_DIR}/clip-${index}.mp4`;
    await browser.pushFile(remotePath, content.toString('base64'));
    // Unlike images, videos are indexed without metadata (duration) until scanned, and the photo picker hides them.
    await browser.execute('mobile: broadcast', {
      action: 'android.intent.action.MEDIA_SCANNER_SCAN_FILE',
      uri: `file://${remotePath}`,
    });
  }
}

// Copies the fixture images to the device gallery, making them the most recent photos.
// On Android 11+ shared storage is indexed by MediaProvider as soon as the file is written.
export async function pushGalleryImages() {
  for (const name of FIXTURE_IMAGES) {
    const content = await readFile(path.resolve(import.meta.dirname, '../fixtures/images', name));
    await browser.pushFile(`${GALLERY_DIR}/${name}`, content.toString('base64'));
  }
}
