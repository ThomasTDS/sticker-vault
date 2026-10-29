import { Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import HomePage from '../pageobjects/home.page.ts';
import { chooseShareTarget } from '../support/share-sheet.ts';

When('escolho o Sticker Vault no menu de compartilhamento', async () => {
  await chooseShareTarget('Sticker Vault');
});

Then('devo ver {int} gaveta(s) no cofre', async (count: number) => {
  await expect(HomePage.packNames).toBeElementsArrayOfSize(count);
});
