import { $, $$, browser } from '@wdio/globals';

// Pushed files are indexed in the background; on a slow CI emulator the picker can open before the first
// one is listed, and it shows it as soon as it is.
const FIRST_ITEM_TIMEOUT_MS = 45000;

// Android system photo picker (part of the MediaProvider module, outside the app).
class PhotoPicker {
  get thumbnails() {
    return $$('android=new UiSelector().resourceIdMatches(".*:id/icon_thumbnail")');
  }

  get addButton() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/button_add")');
  }

  // Photos are listed from newest to oldest, so the first ones are the most recently added.
  // Media scanning is asynchronous, so the picker may open before every pushed file is listed.
  async selectNewest(count: number) {
    await this.thumbnails[0].waitForDisplayed({ timeout: FIRST_ITEM_TIMEOUT_MS });
    await browser.waitUntil(async () => (await this.thumbnails.length) >= count, {
      timeoutMsg: `The photo picker did not list ${count} items`,
    });
    for (let index = 0; index < count; index++) {
      await this.thumbnails[index].click();
    }
    // The Add button only appears after the picker registers a selection.
    await this.addButton.waitForDisplayed({
      timeoutMsg:
        'The photo picker did not register the selection. If it ignores every tap, restart the emulator (adb reboot).',
    });
    await this.addButton.click();
  }

  // In single-selection mode the picker closes as soon as a photo is tapped.
  async selectNewestSingle() {
    await this.thumbnails[0].waitForDisplayed({ timeout: FIRST_ITEM_TIMEOUT_MS });
    await this.thumbnails[0].click();
  }
}

export default new PhotoPicker();
