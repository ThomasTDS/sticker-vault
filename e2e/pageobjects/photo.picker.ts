import { $, $$ } from '@wdio/globals';

// Android system photo picker (part of the MediaProvider module, outside the app).
class PhotoPicker {
  get thumbnails() {
    return $$('android=new UiSelector().resourceIdMatches(".*:id/icon_thumbnail")');
  }

  get addButton() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/button_add")');
  }

  // Photos are listed from newest to oldest, so the first ones are the most recently added.
  async selectNewest(count: number) {
    await this.thumbnails[0].waitForDisplayed();
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
}

export default new PhotoPicker();
