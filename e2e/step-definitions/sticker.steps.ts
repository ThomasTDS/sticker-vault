import { Given, Then, When } from '@wdio/cucumber-framework';
import { browser, expect } from '@wdio/globals';
import AlertDialog from '../pageobjects/alert.dialog.ts';
import PackPage from '../pageobjects/pack.page.ts';
import PhotoPicker from '../pageobjects/photo.picker.ts';
import { pushGalleryImages } from '../support/device.ts';

async function addImagesFromGallery(count: number) {
  await pushGalleryImages();
  await PackPage.addStickersButton.click();
  await PhotoPicker.selectNewest(count);
  await PackPage.waitForStickersSaved();
}

Given('que eu adicionei {int} imagem/imagens da galeria', addImagesFromGallery);

When('eu adiciono {int} imagem/imagens da galeria', addImagesFromGallery);

When('eu removo a primeira figurinha', async () => {
  const sticker = PackPage.stickerAt(0);
  await sticker.waitForDisplayed();
  // React Native fires onLongPress after 500 ms, so the press must last longer than that.
  await browser.execute('mobile: longClickGesture', { elementId: await sticker.elementId, duration: 1000 });
  await AlertDialog.choose('Remover');
});

Then('devo ver {int} figurinha(s) na gaveta', async (count: number) => {
  await expect(PackPage.stickers).toBeElementsArrayOfSize(count);
});
