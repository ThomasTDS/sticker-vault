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
const FIXTURE_GIF = 'bolinha.gif';

// Copies a fixture to the device gallery three times (name-1 to name-3), so the photo picker lists the copies
// as the most recent items. The files are scanned because videos are indexed without metadata (duration)
// until then, and the photo picker hides them; for GIFs the scan is harmless.
async function pushGalleryCopies(fixture: string, remoteDir: string, prepare = (content: Buffer) => content) {
  const content = prepare(await readFile(path.resolve(import.meta.dirname, '../fixtures', fixture)));
  const { name, ext } = path.parse(fixture);
  for (let index = 1; index <= 3; index++) {
    const remotePath = `${remoteDir}/${name}-${index}${ext}`;
    await browser.pushFile(remotePath, content.toString('base64'));
    await browser.execute('mobile: broadcast', {
      action: 'android.intent.action.MEDIA_SCANNER_SCAN_FILE',
      uri: `file://${remotePath}`,
    });
  }
}

// MP4 dates count seconds since 1904-01-01.
const MP4_EPOCH_OFFSET_S = 2082844800;

// The photo picker sorts by the date the media was taken, which for videos comes from the MP4 header
// (mvhd box, version 0: creation time right after version and flags). Setting it to now makes the copies
// newer than the photos pushed by other scenarios, as a video just recorded on the phone would be.
function withRecordingDateNow(content: Buffer) {
  const mvhd = content.indexOf('mvhd');
  if (mvhd < 0 || content[mvhd + 4] !== 0) {
    throw new Error('The fixture video has no version 0 mvhd box');
  }
  const copy = Buffer.from(content);
  const now = Math.floor(Date.now() / 1000) + MP4_EPOCH_OFFSET_S;
  copy.writeUInt32BE(now, mvhd + 8);
  copy.writeUInt32BE(now, mvhd + 12);
  return copy;
}

export const pushGalleryVideos = () => pushGalleryCopies(`videos/${FIXTURE_VIDEO}`, VIDEOS_DIR, withRecordingDateNow);

export const pushGalleryGifs = () => pushGalleryCopies(`gifs/${FIXTURE_GIF}`, GALLERY_DIR);

// Copies the fixture images to the device gallery, making them the most recent photos.
// On Android 11+ shared storage is indexed by MediaProvider as soon as the file is written.
export async function pushGalleryImages() {
  for (const name of FIXTURE_IMAGES) {
    const content = await readFile(path.resolve(import.meta.dirname, '../fixtures/images', name));
    await browser.pushFile(`${GALLERY_DIR}/${name}`, content.toString('base64'));
  }
}
