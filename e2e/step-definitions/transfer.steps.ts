import { Given, Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import DocumentPicker from '../pageobjects/document.picker.ts';
import HomePage from '../pageobjects/home.page.ts';
import PackPage from '../pageobjects/pack.page.ts';
import { buildPackFile, pushToDownloads } from '../support/pack-files.ts';

Given('que recebi o arquivo de gaveta {string} da gaveta {string}', async (fileName: string, packName: string) => {
  await pushToDownloads(fileName, await buildPackFile(packName, ['😂', '🔥']));
});

Given('que recebi o arquivo inválido {string}', async (fileName: string) => {
  await pushToDownloads(fileName, new TextEncoder().encode('isto não é uma gaveta'));
});

When('eu compartilho a gaveta', async () => {
  await PackPage.shareButton.click();
});

When('eu importo o arquivo {string}', async (fileName: string) => {
  await HomePage.importButton.click();
  await DocumentPicker.open(fileName);
});

Then('o botão de compartilhar a gaveta deve estar desabilitado', async () => {
  await expect(PackPage.shareButton).toBeDisabled();
});
