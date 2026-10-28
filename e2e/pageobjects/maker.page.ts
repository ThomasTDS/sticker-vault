import { $ } from '@wdio/globals';
import BasePage from './base.page.ts';

class MakerPage extends BasePage {
  get emptyMessage() {
    return this.byTestId('maker-empty-message');
  }

  get previewImage() {
    return this.byTestId('maker-preview-image');
  }

  get previewTop() {
    return this.byTestId('maker-preview-top');
  }

  get previewBottom() {
    return this.byTestId('maker-preview-bottom');
  }

  get pickButton() {
    return this.byTestId('maker-pick-button');
  }

  get backgroundButton() {
    return this.byTestId('maker-background-button');
  }

  get backgroundStatus() {
    return this.byTestId('maker-background-status');
  }

  get saveButton() {
    return this.scrollTo('maker-save-button');
  }

  // The screen scrolls; UiScrollable brings the element into view before it is used.
  private scrollTo(testId: string) {
    return $(
      `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().resourceId("${testId}"))`,
    );
  }

  async waitForScreen() {
    await this.pickButton.waitForDisplayed();
  }

  async fillTopText(text: string) {
    await this.scrollTo('maker-top-text-input').setValue(text);
  }

  async fillBottomText(text: string) {
    await this.scrollTo('maker-bottom-text-input').setValue(text);
  }

  // Background removal runs on the device and may need a few seconds the first time.
  async waitForBackgroundRemoved() {
    await this.backgroundStatus.waitForDisplayed({ timeout: 60000 });
  }
}

export default new MakerPage();
