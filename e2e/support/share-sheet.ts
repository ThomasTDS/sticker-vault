import { $, browser } from '@wdio/globals';
import { APP_ID } from './device.ts';

// The Android share sheet belongs to the system (IntentResolver), so it is detected by the foreground package.
export async function waitForShareSheet() {
  await browser.waitUntil(async () => (await browser.getCurrentPackage()) !== APP_ID, {
    timeoutMsg: 'The Android share sheet did not open',
  });
}

// Picks an app in the share sheet by its label; on small screens the app row may need to be scrolled into view.
export async function chooseShareTarget(label: string) {
  await waitForShareSheet();
  const target = $(`android=new UiSelector().resourceId("android:id/text1").text("${label}")`);
  if (!(await target.isDisplayed())) {
    await $(
      `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("${label}"))`,
    ).isExisting();
  }
  await target.click();
}

export async function closeShareSheet() {
  await browser.back();
  await browser.waitUntil(async () => (await browser.getCurrentPackage()) === APP_ID, {
    timeoutMsg: 'The app did not come back after closing the share sheet',
  });
}
