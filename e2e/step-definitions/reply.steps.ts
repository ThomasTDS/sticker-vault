import { Given, Then, When } from '@wdio/cucumber-framework';
import { browser, expect } from '@wdio/globals';
import FolderPicker from '../pageobjects/folder.picker.ts';
import HomePage from '../pageobjects/home.page.ts';
import ReplyPage from '../pageobjects/reply.page.ts';
import { pushReceivedSticker } from '../support/device.ts';
import { closeShareSheet, waitForShareSheet } from '../support/share-sheet.ts';

async function openReplyScreen() {
  await HomePage.replyButton.click();
  await browser.waitUntil(
    async () => (await ReplyPage.accessScreen.isDisplayed()) || (await ReplyPage.receivedHint.isDisplayed()),
    { timeoutMsg: 'The reply screen did not open' },
  );
}

async function grantFolderAccess() {
  await ReplyPage.grantButton.click();
  await FolderPicker.confirmCurrentFolder();
  await ReplyPage.receivedHint.waitForDisplayed({ timeout: 15000 });
}

async function emojiOf(index: number) {
  return ReplyPage.suggestion(index - 1).getAttribute('content-desc');
}

Given('que recebi no WhatsApp a figurinha {string}', pushReceivedSticker);

Given('que dei acesso às figurinhas recebidas', async () => {
  await openReplyScreen();
  await grantFolderAccess();
});

When('eu abro a tela de responder figurinha', openReplyScreen);

When('eu dou acesso à pasta de figurinhas do WhatsApp', grantFolderAccess);

When('eu volto e abro de novo a tela de responder figurinha', async () => {
  await browser.back();
  await HomePage.replyButton.waitForDisplayed();
  await openReplyScreen();
});

When('eu escolho a figurinha recebida mais recente', async () => {
  await ReplyPage.receivedSticker(0).waitForDisplayed({ timeout: 15000 });
  await ReplyPage.receivedSticker(0).click();
});

When('eu digo que ela quer dizer {string}', async (emoji: string) => {
  if (!(await ReplyPage.emojiOption(emoji).isDisplayed())) {
    await ReplyPage.changeEmojiButton.click();
  }
  await ReplyPage.emojiOption(emoji).click();
});

When('eu toco na sugestão {int}', async (position: number) => {
  await ReplyPage.suggestion(position - 1).click();
});

Then('devo ver o pedido de acesso às figurinhas recebidas', async () => {
  await expect(ReplyPage.grantButton).toBeDisplayed();
});

Then('devo ver a lista de figurinhas recebidas', async () => {
  await expect(ReplyPage.receivedHint).toBeDisplayed();
  await expect(ReplyPage.receivedSticker(0)).toBeDisplayed();
});

Then('devo ver que a figurinha recebida diz {string}', async (emojis: string) => {
  await expect(ReplyPage.targetEmojis).toHaveText(emojis);
});

Then('devo ver o aviso de figurinha sem emojis', async () => {
  await expect(ReplyPage.noEmojisMessage).toBeDisplayed();
});

Then('devo ver {int} sugestão/sugestões de resposta', async (count: number) => {
  await ReplyPage.suggestion(0).waitForDisplayed();
  await expect(ReplyPage.suggestions).toBeElementsArrayOfSize(count);
});

Then('a sugestão {int} deve ser a figurinha {string}', async (position: number, emojis: string) => {
  expect(await emojiOf(position)).toBe(`Figurinha ${emojis}`);
});

Then('devo ver o aviso de que nenhuma figurinha combina', async () => {
  await expect(ReplyPage.emptySuggestions).toBeDisplayed();
});

Then('o menu de compartilhamento deve abrir', async () => {
  await waitForShareSheet();
  await closeShareSheet();
});
