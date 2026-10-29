import { Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import FilesApp from '../pageobjects/files.app.ts';
import HomePage from '../pageobjects/home.page.ts';
import ImportPage from '../pageobjects/import.page.ts';
import PackPage from '../pageobjects/pack.page.ts';

When('eu abro o arquivo {string} pelo app Arquivos do Android', async (fileName: string) => {
  await FilesApp.openFile(fileName);
});

When('volto da gaveta importada para o cofre', async () => {
  await PackPage.waitForScreen();
  await HomePage.goBackToHome();
});

When('toco em voltar para o cofre', async () => {
  await ImportPage.backButton.click();
  await HomePage.waitForScreen();
});

Then('devo ver a mensagem de importação {string}', async (text: string) => {
  await expect(ImportPage.errorMessage).toHaveText(text);
});
