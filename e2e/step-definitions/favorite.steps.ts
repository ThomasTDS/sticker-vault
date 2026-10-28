import { Given, Then, When } from '@wdio/cucumber-framework';
import { browser, expect } from '@wdio/globals';
import HomePage from '../pageobjects/home.page.ts';
import PackPage from '../pageobjects/pack.page.ts';
import StickerPage from '../pageobjects/sticker.page.ts';
import { closeShareSheet, waitForShareSheet } from '../support/share-sheet.ts';

async function openSticker(position: number) {
  await PackPage.stickerAt(position - 1).click();
  await StickerPage.waitForScreen();
}

async function backToPack() {
  await browser.back();
  await PackPage.waitForScreen();
}

Given('que a figurinha {int} da gaveta é favorita', async (position: number) => {
  await openSticker(position);
  await StickerPage.favoriteButton.click();
  await backToPack();
});

Given('que compartilhei a figurinha {int} da gaveta {int} vez/vezes', async (position: number, times: number) => {
  await openSticker(position);
  for (let i = 0; i < times; i++) {
    await StickerPage.shareButton.click();
    await waitForShareSheet();
    await closeShareSheet();
  }
  await backToPack();
});

When('toco no botão de favorito', async () => {
  await StickerPage.favoriteButton.click();
});

When('volto para a gaveta', backToPack);

When('compartilho a figurinha', async () => {
  await StickerPage.shareButton.click();
});

When('fecho o seletor de compartilhamento', closeShareSheet);

Then('devo ver o botão de favorito {string}', async (label: string) => {
  await expect(StickerPage.favoriteButtonLabel).toHaveText(label);
});

Then('a figurinha {int} da gaveta deve estar marcada como favorita', async (position: number) => {
  await expect(PackPage.favoriteBadgeAt(position - 1)).toBeDisplayed();
});

Then('devo ver {int} figurinha(s) na seção de favoritas', async (count: number) => {
  await expect(HomePage.favoritesSection).toBeDisplayed();
  await expect(HomePage.favoriteItems).toBeElementsArrayOfSize(count);
});

Then('não devo ver a seção de favoritas', async () => {
  await expect(HomePage.favoritesSection).not.toBeDisplayed();
});

Then('o seletor de compartilhamento do Android deve abrir', waitForShareSheet);

Then('devo ver o contador de uso {string}', async (text: string) => {
  await expect(StickerPage.useCount).toHaveText(text);
});

Then('a seção de mais usadas deve mostrar {string}', async (expected: string) => {
  const counts = await HomePage.mostUsedCounts.map((element) => element.getText());
  expect(counts.join(', ')).toBe(expected);
});
