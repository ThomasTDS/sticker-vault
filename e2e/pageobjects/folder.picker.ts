import { $ } from '@wdio/globals';

// Android system folder picker (DocumentsUI, ACTION_OPEN_DOCUMENT_TREE), opened already inside the folder.
class FolderPicker {
  get useFolderButton() {
    return $('android=new UiSelector().packageName("com.google.android.documentsui").textMatches("(?i)use this folder|usar esta pasta")');
  }

  get allowButton() {
    return $('android=new UiSelector().resourceId("android:id/button1").textMatches("(?i)allow|permitir")');
  }

  async confirmCurrentFolder() {
    await this.useFolderButton.waitForDisplayed({ timeout: 20000 });
    await this.useFolderButton.click();
    await this.allowButton.waitForDisplayed({ timeout: 10000 });
    await this.allowButton.click();
  }
}

export default new FolderPicker();
