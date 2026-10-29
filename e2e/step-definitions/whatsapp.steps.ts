import { Then, When } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import AlertDialog from '../pageobjects/alert.dialog.ts';
import PackPage from '../pageobjects/pack.page.ts';

When('eu mando a gaveta pro WhatsApp', async () => {
  await PackPage.sendToWhatsAppButton.waitForEnabled();
  await PackPage.sendToWhatsAppButton.click();
});

Then('o botão de mandar pro WhatsApp deve estar desabilitado', async () => {
  await expect(PackPage.sendToWhatsAppButton).toBeDisabled();
});

Then('o botão de mandar pro WhatsApp deve estar habilitado', async () => {
  await expect(PackPage.sendToWhatsAppButton).toBeEnabled();
});

Then('devo ver o alerta {string}', async (title: string) => {
  await expect(AlertDialog.title).toHaveText(title);
});
