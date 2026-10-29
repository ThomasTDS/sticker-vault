import { Given, Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import HomePage from '../pageobjects/home.page.ts';
import NewPackPage from '../pageobjects/new-pack.page.ts';
import PackPage from '../pageobjects/pack.page.ts';
import PhotoPicker from '../pageobjects/photo.picker.ts';
import { pushGalleryVideos } from '../support/device.ts';

// Each video is decoded and encoded as an animated WebP on the device, which can take a while per video.
const ANIMATION_TIMEOUT_MS = 240000;

async function createAnimatedPack(name: string, publisher: string) {
  await HomePage.newPackButton.click();
  await NewPackPage.fill(name, publisher);
  await NewPackPage.animatedSwitch.click();
  await NewPackPage.submit();
  await PackPage.waitForScreen();
}

async function addVideosFromGallery(count: number) {
  await pushGalleryVideos();
  await PackPage.addStickersButton.click();
  await PhotoPicker.selectNewest(count);
  await PackPage.waitForStickersSaved(ANIMATION_TIMEOUT_MS);
}

Given('que existe a gaveta animada {string} com o autor {string}', createAnimatedPack);

When('eu crio a gaveta animada {string} com o autor {string}', createAnimatedPack);

Given('que eu adicionei {int} vídeo(s) da galeria', { timeout: ANIMATION_TIMEOUT_MS + 60000 }, addVideosFromGallery);

When('eu adiciono {int} vídeo(s) da galeria', { timeout: ANIMATION_TIMEOUT_MS + 60000 }, addVideosFromGallery);

Then('devo ver a indicação {string}', async (text: string) => {
  await expect(PackPage.typeLabel).toHaveText(text);
});

Then('não devo ver o botão de criar figurinha', async () => {
  await expect(PackPage.createStickerButton).not.toBeDisplayed();
});
