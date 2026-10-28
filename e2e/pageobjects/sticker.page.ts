import { $ } from '@wdio/globals';
import BasePage from './base.page.ts';

class StickerPage extends BasePage {
  get image() {
    return this.byTestId('sticker-image');
  }

  get selectedEmojis() {
    return this.byTestId('sticker-emoji-selected');
  }

  get emojiHint() {
    return this.byTestId('sticker-emoji-hint');
  }

  get tagsInput() {
    return this.byTestId('sticker-tags-input');
  }

  get saveButton() {
    return this.byTestId('sticker-save-button');
  }

  emojiOption(emoji: string) {
    return $(`android=new UiSelector().className("android.widget.TextView").text("${emoji}")`);
  }

  async waitForScreen() {
    await this.saveButton.waitForDisplayed();
  }

  async chooseEmojis(emojis: string[]) {
    for (const emoji of emojis) {
      await this.emojiOption(emoji).click();
    }
  }

  async save() {
    await this.saveButton.click();
  }
}

export default new StickerPage();
