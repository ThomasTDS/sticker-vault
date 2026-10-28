import { Given, Then, When } from '@wdio/cucumber-framework';
import { browser, expect } from '@wdio/globals';
import AlertDialog from '../pageobjects/alert.dialog.ts';
import HomePage from '../pageobjects/home.page.ts';
import NewPackPage from '../pageobjects/new-pack.page.ts';
import PackPage from '../pageobjects/pack.page.ts';

async function createPack(name: string, publisher: string) {
  await HomePage.newPackButton.click();
  await NewPackPage.fill(name, publisher);
  await NewPackPage.submit();
  await PackPage.waitForScreen();
}

Given('que existe a gaveta {string} com o autor {string}', createPack);

When('eu crio a gaveta {string} com o autor {string}', createPack);

When('eu tento criar uma gaveta sem preencher os campos', async () => {
  await HomePage.newPackButton.click();
  await NewPackPage.submit();
});

When('volto para a tela inicial', async () => {
  await browser.back();
  await HomePage.waitForScreen();
});

When('eu excluo a gaveta aberta', async () => {
  await PackPage.deleteButton.click();
  await AlertDialog.choose('Excluir');
  await HomePage.waitForScreen();
});

Then('devo ver a gaveta {string} aberta', async (name: string) => {
  await expect(PackPage.name).toHaveText(name);
});

Then('devo ver o autor {string}', async (text: string) => {
  await expect(PackPage.publisher).toHaveText(text);
});

Then('devo ver o contador {string}', async (text: string) => {
  await expect(PackPage.stickerCount).toHaveText(text);
});

Then('devo ver o aviso {string}', async (text: string) => {
  await expect(PackPage.minStickersHint).toHaveText(text);
});

Then('não devo ver o aviso de figurinhas faltando', async () => {
  await expect(PackPage.minStickersHint).not.toBeDisplayed();
});

Then('devo ver a mensagem de gaveta vazia {string}', async (text: string) => {
  await expect(PackPage.emptyMessage).toHaveText(text);
});

Then('devo ver a gaveta {string} na lista com {string}', async (name: string, count: string) => {
  const index = await HomePage.findPackIndex(name);
  await expect(HomePage.packCountAt(index)).toHaveText(count);
});

Then('devo ver o erro de nome {string}', async (text: string) => {
  await expect(NewPackPage.nameError).toHaveText(text);
});

Then('devo ver o erro de autor {string}', async (text: string) => {
  await expect(NewPackPage.publisherError).toHaveText(text);
});
