import { Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import MakerPage from '../pageobjects/maker.page.ts';
import PackPage from '../pageobjects/pack.page.ts';
import PhotoPicker from '../pageobjects/photo.picker.ts';
import { pushGalleryImages } from '../support/device.ts';

When('eu abro o criador de figurinhas', async () => {
  await PackPage.createStickerButton.click();
  await MakerPage.waitForScreen();
});

When('escolho uma foto da galeria para a figurinha', async () => {
  await pushGalleryImages();
  await MakerPage.pickButton.click();
  await PhotoPicker.selectNewestSingle();
  await MakerPage.previewImage.waitForDisplayed();
});

When('escrevo {string} no texto de cima', async (text: string) => {
  await MakerPage.fillTopText(text);
});

When('escrevo {string} no texto de baixo', async (text: string) => {
  await MakerPage.fillBottomText(text);
});

When('removo o fundo da foto', async () => {
  await MakerPage.backgroundButton.click();
  await MakerPage.waitForBackgroundRemoved();
});

When('restauro o fundo da foto', async () => {
  await MakerPage.backgroundButton.click();
});

When('salvo a figurinha criada', async () => {
  await MakerPage.scrollToEnd();
  await MakerPage.saveButton.click();
  await PackPage.waitForScreen();
});

Then('devo ver a mensagem do criador {string}', async (text: string) => {
  await expect(MakerPage.emptyMessage).toHaveText(text);
});

Then('o botão de salvar a figurinha criada deve estar desabilitado', async () => {
  await MakerPage.scrollToEnd();
  await expect(MakerPage.saveButton).toBeDisabled();
});

Then('o botão de remover fundo deve estar desabilitado', async () => {
  await expect(MakerPage.backgroundButton).toBeDisabled();
});

Then('a prévia deve mostrar {string} em cima e {string} embaixo', async (top: string, bottom: string) => {
  await expect(MakerPage.previewTop).toHaveText(top);
  await expect(MakerPage.previewBottom).toHaveText(bottom);
});

Then('devo ver o aviso do criador {string}', async (text: string) => {
  await expect(MakerPage.backgroundStatus).toHaveText(text);
});

Then('não devo ver o aviso de fundo removido', async () => {
  await expect(MakerPage.backgroundStatus).not.toBeDisplayed();
});
