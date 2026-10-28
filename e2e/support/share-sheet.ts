import { browser } from '@wdio/globals';
import { APP_ID } from './device.ts';

// The Android share sheet belongs to the system (IntentResolver), so it is detected by the foreground package.
export async function waitForShareSheet() {
  await browser.waitUntil(async () => (await browser.getCurrentPackage()) !== APP_ID, {
    timeoutMsg: 'The Android share sheet did not open',
  });
}

export async function closeShareSheet() {
  await browser.back();
  await browser.waitUntil(async () => (await browser.getCurrentPackage()) === APP_ID, {
    timeoutMsg: 'The app did not come back after closing the share sheet',
  });
}
