import { $, browser } from '@wdio/globals';

const ENTER_KEY = 66;
const DOCUMENTS_UI = 'com.google.android.documentsui';

// Android system file picker (DocumentsUI). Files copied with adb do not show in "Recent", so they are searched by name.
class DocumentPicker {
  get searchButton() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/option_menu_search")');
  }

  get searchInput() {
    return $('android=new UiSelector().resourceIdMatches(".*:id/search_src_text")');
  }

  fileNamed(name: string) {
    return $(`android=new UiSelector().resourceId("android:id/title").text("${name}")`);
  }

  async open(name: string) {
    await this.searchButton.waitForDisplayed({ timeout: 20000 });
    await this.searchButton.click();
    await this.searchInput.setValue(name);
    await browser.pressKeyCode(ENTER_KEY);
    await this.fileNamed(name).waitForDisplayed({ timeout: 20000 });
    await this.fileNamed(name).click();
    await this.confirmIfSelectionMode();
  }

  get selectButton() {
    return $('android=new UiSelector().packageName("com.google.android.documentsui").textMatches("(?i)select|selecionar")');
  }

  // On a slow device the tap may be read as a long press, which only selects the file and shows a "Select" button.
  private async confirmIfSelectionMode() {
    await browser.waitUntil(
      async () => (await browser.getCurrentPackage()) !== DOCUMENTS_UI || (await this.selectButton.isDisplayed()),
      { timeout: 20000, timeoutMsg: 'The file picker did not return the chosen file' },
    );
    if ((await browser.getCurrentPackage()) === DOCUMENTS_UI) {
      await this.selectButton.click();
    }
  }
}

export default new DocumentPicker();
