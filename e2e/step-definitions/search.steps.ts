import { Given, Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import HomePage from '../pageobjects/home.page.ts';
import PackPage from '../pageobjects/pack.page.ts';
import StickerPage from '../pageobjects/sticker.page.ts';

function splitList(text: string) {
  return text.split(',').map((item) => item.trim());
}

async function openSticker(position: number) {
  await PackPage.stickerAt(position - 1).click();
  await StickerPage.waitForScreen();
}

When('eu abro a figurinha {int} da gaveta', openSticker);
When('abro a figurinha {int} da gaveta', openSticker);

When('escolho os emojis {string}', async (emojis: string) => {
  await StickerPage.chooseEmojis(splitList(emojis));
});

When('salvo a figurinha', async () => {
  await StickerPage.save();
  await PackPage.waitForScreen();
});

Given('que a figurinha {int} da gaveta tem a tag {string}', async (position: number, tag: string) => {
  await openSticker(position);
  await StickerPage.fillTags(tag);
  await StickerPage.save();
  await PackPage.waitForScreen();
});

Given('que a figurinha {int} da gaveta tem os emojis {string}', async (position: number, emojis: string) => {
  await openSticker(position);
  await StickerPage.chooseEmojis(splitList(emojis));
  await StickerPage.save();
  await PackPage.waitForScreen();
});

When('busco por {string}', async (text: string) => {
  await HomePage.search(text);
});

Then('devo ver os emojis escolhidos {string}', async (text: string) => {
  await expect(StickerPage.selectedEmojis).toHaveText(text);
});

Then('devo ver a dica de emojis {string}', async (text: string) => {
  await expect(StickerPage.emojiHint).toHaveText(text);
});

Then('devo ver {int} figurinha(s) nos resultados da busca', async (count: number) => {
  await expect(HomePage.searchResults).toBeElementsArrayOfSize(count);
});

Then('o resultado {int} deve ser da gaveta {string}', async (position: number, packName: string) => {
  await expect(HomePage.searchResultPackAt(position - 1)).toHaveText(packName);
});

Then('devo ver a mensagem de busca vazia {string}', async (text: string) => {
  await expect(HomePage.searchEmptyMessage).toHaveText(text);
});
