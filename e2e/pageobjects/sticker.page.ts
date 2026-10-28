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

  get favoriteButton() {
    return this.byTestId('sticker-favorite-button');
  }

  get favoriteButtonLabel() {
    return this.favoriteButton.$('android.widget.TextView');
  }

  get shareButton() {
    return this.byTestId('sticker-share-button');
  }

  get useCount() {
    return this.byTestId('sticker-use-count');
  }

  get saveButton() {
    return this.byTestId('sticker-save-button');
  }

  // The screen scrolls; UiScrollable brings the element into view before it is used.
  private scrollTo(target: string) {
    return $(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(${target})`);
  }

  emojiOption(emoji: string) {
    return this.scrollTo(`new UiSelector().className("android.widget.TextView").text("${emoji}")`);
  }

  async waitForScreen() {
    await this.favoriteButton.waitForDisplayed();
  }

  async chooseEmojis(emojis: string[]) {
    for (const emoji of emojis) {
      await this.emojiOption(emoji).click();
    }
  }

  async fillTags(text: string) {
    await this.scrollTo('new UiSelector().resourceId("sticker-tags-input")').setValue(text);
  }

  async save() {
    await this.scrollTo('new UiSelector().resourceId("sticker-save-button")').click();
  }
}

export default new StickerPage();
