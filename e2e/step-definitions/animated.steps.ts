import { Given, Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import HomePage from '../pageobjects/home.page.ts';
import NewPackPage from '../pageobjects/new-pack.page.ts';
import PackPage from '../pageobjects/pack.page.ts';
import PhotoPicker from '../pageobjects/photo.picker.ts';
import SegmentPicker from '../pageobjects/segment.picker.ts';
import { pushGalleryGifs, pushGalleryImages, pushGalleryLongVideo, pushGalleryVideos } from '../support/device.ts';

// Each video or GIF is decoded and encoded as an animated WebP on the device, which can take a while.
const ANIMATION_TIMEOUT_MS = 240000;

async function createAnimatedPack(name: string, publisher: string) {
  await HomePage.newPackButton.click();
  await NewPackPage.fill(name, publisher);
  await NewPackPage.animatedSwitch.click();
  await NewPackPage.submit();
  await PackPage.waitForScreen();
}

async function addFromGallery(pushFixtures: () => Promise<void>, count: number) {
  await pushFixtures();
  await PackPage.addStickersButton.click();
  await PhotoPicker.selectNewest(count);
  await PackPage.waitForStickersSaved(ANIMATION_TIMEOUT_MS);
}

const addVideosFromGallery = (count: number) => addFromGallery(pushGalleryVideos, count);

Given('que existe a gaveta animada {string} com o autor {string}', createAnimatedPack);

When('eu crio a gaveta animada {string} com o autor {string}', createAnimatedPack);

Given('que eu adicionei {int} vídeo(s) da galeria', { timeout: ANIMATION_TIMEOUT_MS + 60000 }, addVideosFromGallery);

When('eu adiciono {int} vídeo(s) da galeria', { timeout: ANIMATION_TIMEOUT_MS + 60000 }, addVideosFromGallery);

When('eu adiciono {int} GIF(s) da galeria', { timeout: ANIMATION_TIMEOUT_MS + 60000 }, (count: number) =>
  addFromGallery(pushGalleryGifs, count),
);

When('eu escolho uma foto parada da galeria', async () => {
  await pushGalleryImages();
  await PackPage.addStickersButton.click();
  await PhotoPicker.selectNewest(1);
});

Then('devo ver a indicação {string}', async (text: string) => {
  await expect(PackPage.typeLabel).toHaveText(text);
});

Then('não devo ver o botão de criar figurinha', async () => {
  await expect(PackPage.createStickerButton).not.toBeDisplayed();
});

When('eu escolho um vídeo de 12 segundos da galeria', async () => {
  await pushGalleryLongVideo();
  await PackPage.addStickersButton.click();
  await PhotoPicker.selectNewest(1);
  await SegmentPicker.waitForDialog();
});

Then('devo ver o trecho {string}', async (range: string) => {
  await expect(SegmentPicker.range).toHaveText(range);
});

When('eu começo o trecho em {int} segundo(s)', async (seconds: number) => {
  await SegmentPicker.setStart(seconds * 1000);
});

When('eu confirmo o trecho', { timeout: ANIMATION_TIMEOUT_MS + 60000 }, async () => {
  await SegmentPicker.confirmButton.click();
  await PackPage.waitForStickersSaved(ANIMATION_TIMEOUT_MS);
});

When('eu pulo o arquivo', async () => {
  await SegmentPicker.skipButton.click();
  await PackPage.waitForStickersSaved();
});
