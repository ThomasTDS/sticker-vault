import { $, browser } from '@wdio/globals';
import { APP_ID } from './device.ts';

// The Android share sheet belongs to the system (IntentResolver), so it is detected by the foreground package.
export async function waitForShareSheet() {
  await browser.waitUntil(async () => (await browser.getCurrentPackage()) !== APP_ID, {
    timeoutMsg: 'The Android share sheet did not open',
  });
}

// Picks an app in the share sheet by its label. The app row can take a while to load (larger files) and,
// on small screens, may be below the fold: the sheet is then swiped up to expand it. UiScrollable is not used
// because it first scrolls back to the top, and swiping down closes the share sheet.
export async function chooseShareTarget(label: string) {
  await waitForShareSheet();
  const target = $(`android=new UiSelector().resourceId("android:id/text1").text("${label}")`);
  const visible = await target.waitForDisplayed({ timeout: 15000 }).catch(() => false);
  if (!visible) {
    const { width, height } = await browser.getWindowSize();
    await browser.execute('mobile: swipeGesture', {
      left: 0,
      top: Math.round(height / 2),
      width,
      height: Math.round(height / 2),
      direction: 'up',
      percent: 0.75,
    });
    await target.waitForDisplayed({ timeout: 15000 });
  }
  await target.click();
}

export async function closeShareSheet() {
  await browser.back();
  await browser.waitUntil(async () => (await browser.getCurrentPackage()) === APP_ID, {
    timeoutMsg: 'The app did not come back after closing the share sheet',
  });
}
