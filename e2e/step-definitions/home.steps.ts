import { Given, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import HomePage from '../pageobjects/home.page.ts';

Given('que o app foi aberto', async () => {
  await HomePage.waitForScreen();
});

Then('devo ver o título {string}', async (text: string) => {
  await expect(HomePage.title).toHaveText(text);
});

Then('devo ver o subtítulo {string}', async (text: string) => {
  await expect(HomePage.subtitle).toHaveText(text);
});

Then('devo ver a mensagem de cofre vazio {string}', async (text: string) => {
  await expect(HomePage.emptyState).toBeDisplayed();
  await expect(HomePage.emptyStateMessage).toHaveText(text);
});

Then('devo ver a dica {string}', async (text: string) => {
  await expect(HomePage.emptyStateHint).toHaveText(text);
});
