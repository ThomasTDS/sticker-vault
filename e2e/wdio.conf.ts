import { browser } from '@wdio/globals';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const apkPath =
  process.env.APK_PATH ??
  path.resolve(import.meta.dirname, '../mobile/android/app/build/outputs/apk/release/app-release.apk');

export const config: WebdriverIO.Config = {
  runner: 'local',
  tsConfigPath: './tsconfig.json',

  specs: ['./features/**/*.feature'],
  maxInstances: 1,

  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.DEVICE_NAME ?? 'Android Emulator',
      'appium:app': apkPath,
      'appium:enforceAppInstall': true,
      'appium:autoGrantPermissions': true,
      'appium:newCommandTimeout': 240,
      'appium:adbExecTimeout': 60000,
    },
  ],

  logLevel: 'warn',
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 2,

  services: [['appium', { logPath: './logs' }]],
  port: 4723,

  framework: 'cucumber',
  reporters: [
    'spec',
    [
      'junit',
      {
        outputDir: './reports/junit',
        outputFileFormat: ({ cid }: { cid: string }) => `results-${cid}.xml`,
      },
    ],
  ],
  // On CI an emulator hiccup should not fail a whole feature, so each feature file gets one more attempt.
  specFileRetries: process.env.CI ? 1 : 0,
  cucumberOpts: {
    require: ['./step-definitions/**/*.ts'],
    timeout: 60000,
    // @modelo-ml needs the ML Kit model, downloaded by Google Play services only on devices with a Google account.
    tags: 'not @modelo-ml',
  },

  // Saves a screenshot of the device whenever a step fails, to help diagnose the failure.
  afterStep: async (step, scenario, result) => {
    if (result.passed) {
      return;
    }
    const directory = path.resolve(import.meta.dirname, 'reports/screenshots');
    await mkdir(directory, { recursive: true });
    const name = `${scenario.name}-${step.text}`.replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 120);
    await browser.saveScreenshot(path.join(directory, `${Date.now()}-${name}.png`));
  },
};
