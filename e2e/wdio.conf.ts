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
  reporters: ['spec'],
  cucumberOpts: {
    require: ['./step-definitions/**/*.ts'],
    timeout: 60000,
  },
};
