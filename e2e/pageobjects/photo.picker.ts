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
    await this.addButton.click();
  }
}

export default new PhotoPicker();
