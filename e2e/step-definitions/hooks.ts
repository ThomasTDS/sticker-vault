import { Before } from '@wdio/cucumber-framework';
import { resetApp } from '../support/device.ts';

Before(async () => {
  await resetApp();
});
