import BasePage from './base.page.ts';

class PackPage extends BasePage {
  get name() {
    return this.byTestId('pack-name');
  }

  get publisher() {
    return this.byTestId('pack-publisher');
  }

  get stickerCount() {
    return this.byTestId('pack-sticker-count');
  }

  get minStickersHint() {
    return this.byTestId('pack-min-hint');
  }

  get emptyMessage() {
    return this.byTestId('pack-empty-message');
  }

  get addStickersButton() {
    return this.byTestId('pack-add-stickers-button');
  }

  get sendToWhatsAppButton() {
    return this.byTestId('pack-send-whatsapp-button');
  }

  get createStickerButton() {
    return this.byTestId('pack-create-sticker-button');
  }

  get deleteButton() {
    return this.byTestId('pack-delete-button');
  }

  get processingIndicator() {
    return this.byTestId('pack-processing');
  }

  get stickers() {
    return this.allByTestIdPattern('pack-sticker-\\d+');
  }

  favoriteBadgeAt(index: number) {
    return this.byTestId(`pack-sticker-favorite-${index}`);
  }

  stickerAt(index: number) {
    return this.byTestId(`pack-sticker-${index}`);
  }

  async waitForScreen() {
    await this.name.waitForDisplayed();
  }

  async waitForStickersSaved() {
    await this.addStickersButton.waitForDisplayed({ timeout: 30000 });
  }
}

export default new PackPage();
