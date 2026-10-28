# Sticker Vault

[Português](README.md) | **English**

Android app for storing WhatsApp stickers and adding them to WhatsApp in just a few taps, built alongside an automated test suite with Appium.

A non-profit study project with two goals: building the app and ensuring its quality with end-to-end tests from the very first screen (a *shift-left* approach).

## Table of contents

- [Status](#status)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment setup](#environment-setup)
- [Running the app](#running-the-app)
- [Running the tests](#running-the-tests)
- [Testing strategy](#testing-strategy)
- [Troubleshooting](#troubleshooting)
- [Next steps](#next-steps)

## Status

In development. You can already create drawers (sticker packs), store stickers imported from the gallery and send drawers to WhatsApp. Stickers can also be tagged with emojis and keywords and searched within the vault. The next step is favorite and most-used stickers.

## Features

Sticker Vault is a vault for your stickers: each pack is a **drawer** (*gaveta*).

- **Drawers:** create them with a name and author, list them on the home screen and delete them with confirmation.
- **Gallery import:** pick several images at once through the Android photo picker.
- **WhatsApp format:** each image is cropped to a square, resized to 512x512 and saved as WebP of up to 100 KB.
- **WhatsApp limits:** 3 to 30 stickers per drawer; the app shows how many are missing to reach the minimum and blocks additions above the maximum.
- **Emojis and tags:** tap a sticker to pick up to 3 emojis (used by WhatsApp to suggest the sticker) and add comma-separated tags.
- **Search:** on the home screen, find stickers by emoji, tag or drawer name, ignoring case and accents.
- **Removing stickers:** long-press a sticker.
- **Sending to WhatsApp:** with 3 or more stickers, the "Mandar pro WhatsApp" button opens WhatsApp's (or WhatsApp Business') own confirmation screen. The drawer icon (96x96) is generated from the first sticker.
- **Privacy:** no account and no ads; data stays on the device only (SQLite and local files).

## Tech stack

| Layer | Technologies |
| --- | --- |
| App | React Native, Expo (SDK 58), Expo Router, TypeScript, expo-sqlite, expo-image-picker, expo-image-manipulator |
| Tests | WebdriverIO 10, Appium 3, UiAutomator2 driver, Cucumber (BDD), TypeScript |
| Platform | Android (distributed directly as an APK, no app store) |

## Repository structure

```
sticker-vault/
├── mobile/                  # React Native app (Expo)
│   ├── src/app/             # Screens (Expo Router routes)
│   ├── src/db/              # Local database (SQLite) and queries
│   ├── src/stickers/        # Sticker file conversion and storage
│   ├── src/theme/           # Light and dark theme colors
│   ├── modules/             # Local native modules (Kotlin), such as the WhatsApp integration
│   ├── plugins/             # Expo config plugins for native adjustments
│   └── app.json             # App configuration
└── e2e/                     # End-to-end tests (Appium + WebdriverIO)
    ├── features/            # Gherkin scenarios (written in Portuguese)
    ├── step-definitions/    # Step implementations
    ├── pageobjects/         # Page Objects (app screens, photo picker and dialogs)
    ├── support/             # Device utilities (app reset, image upload)
    ├── fixtures/            # Images used by the tests
    └── wdio.conf.ts         # WebdriverIO and Appium configuration
```

The app and the tests have independent dependencies: each command must be run inside its own folder (`mobile/` or `e2e/`).

The `mobile/android/` folder is generated automatically by `expo prebuild` and is not versioned. Native adjustments are made through config plugins in `mobile/plugins/`.

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 24 or later | Includes npm |
| [JDK](https://learn.microsoft.com/java/openjdk/download) | 17 | Required for the Android build |
| [Android Studio](https://developer.android.com/studio) | Latest | Android SDK, emulator and build tools |
| CMake (Android SDK) | 3.31.6 | Installed through the SDK Manager, see below |

The development environment is Windows, but the steps also apply to Linux and macOS, adjusting the shell syntax.

## Environment setup

### 1. Environment variables

Set the variables below (paths are examples and may differ on your machine):

```powershell
# PowerShell (persistent for the current user)
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot", "User")
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
```

Also add `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\emulator` to your `Path`. Open a new terminal and check:

```powershell
java -version
adb version
```

### 2. CMake 3.31.6

Building libraries with C++ code (such as `react-native-screens`) requires CMake. The Android SDK's default version (3.22.1) ships with a *ninja* version that does not support paths longer than 260 characters on Windows, which makes the build fail. The project is configured to use version **3.31.6**, which must be installed:

1. In Android Studio, open **Settings → Languages & Frameworks → Android SDK → SDK Tools**.
2. Check **Show Package Details**.
3. Under **CMake**, select version **3.31.6** and click **Apply**.

### 3. Android emulator

In Android Studio, open the **Device Manager** and create a virtual device (for example, *Medium Phone* with a recent system image). To start it from the terminal:

```powershell
emulator -list-avds
emulator -avd <emulator_name>
```

Make sure the device is connected:

```powershell
adb devices
```

### 4. Dependencies

```powershell
git clone https://github.com/ThomasTDS/sticker-vault.git
cd sticker-vault

cd mobile
npm install

cd ..\e2e
npm install
```

Appium and the UiAutomator2 driver are installed locally as `e2e/` dependencies; no global installation is needed.

## Running the app

### Build the release APK

The commands below generate the native project and the APK used by the tests:

```powershell
cd mobile
npm run prebuild
cd android
.\gradlew.bat assembleRelease
```

The file is created at `mobile/android/app/build/outputs/apk/release/app-release.apk`. The first build may take more than 10 minutes; subsequent builds are faster.

To install the APK manually on the emulator or a connected device:

```powershell
adb install -r app\build\outputs\apk\release\app-release.apk
```

### Development mode

To develop with live reload, use the *development build*:

```powershell
cd mobile
npm run android   # builds and installs the development build on the emulator
npm start         # starts the Metro server on subsequent runs
```

### Type checking

```powershell
cd mobile
npm run typecheck
```

## Running the tests

With the emulator running and the release APK built:

```powershell
cd e2e
npm test
```

WebdriverIO starts the Appium server automatically, installs the APK on the device and runs the scenarios in `e2e/features/`. Appium logs are written to `e2e/logs/`.

Current coverage:

| Feature | Scenarios |
| --- | --- |
| Home screen | Empty vault on first launch |
| Drawers | Create a drawer; drawer shows up on the home screen; required name and author validation; delete a drawer |
| Gallery stickers | Add stickers; reach the WhatsApp minimum; remove a sticker |
| Sending to WhatsApp | Sending blocked below the minimum; sending enabled with 3 stickers; WhatsApp-not-installed warning |
| Emojis, tags and search | Pick emojis; 3-emoji limit; search by tag ignoring case and accents; search by emoji; search by drawer name; search with no results |

The sending scenarios run on an emulator without WhatsApp. The confirmation inside WhatsApp is validated manually on a real device:

1. Install the release APK on the phone (`adb install -r` with USB debugging enabled, or by copying the file to the device).
2. Create a drawer with at least 3 stickers.
3. Tap "Mandar pro WhatsApp" and confirm with "Add".
4. In WhatsApp, open the sticker panel and check that the drawer shows up with its icon and stickers.

To run a single feature:

```powershell
npx wdio run ./wdio.conf.ts --spec ./features/gavetas.feature
```

Optional variables:

| Variable | Purpose | Default |
| --- | --- | --- |
| `APK_PATH` | Path to a different APK to test | Release APK in `mobile/android/...` |
| `DEVICE_NAME` | Device name passed to Appium | `Android Emulator` |

Example:

```powershell
$env:APK_PATH = "C:\path\to\app.apk"; npm test
```

To type-check the test project:

```powershell
npm run typecheck
```

## Testing strategy

- **Shift-left:** every new app feature is delivered together with its automated scenarios.
- **BDD with Cucumber:** scenarios are written in Gherkin, in Portuguese (`# language: pt`), and serve as living documentation of the app's behavior.
- **Page Objects:** each screen's selectors and actions live in their own classes in `e2e/pageobjects/`; steps only call these methods.
- **Stable selectors:** every element checked by the tests gets a `testID` in the app. On Android, the `testID` is exposed as the `resource-id`, and the `BasePage`'s `byTestId()` method locates elements by it.
- **Independent scenarios:** app data is cleared before each scenario (`mobile: clearApp`), so no test depends on another.
- **Controlled gallery:** the images in `e2e/fixtures/images/` are pushed to the emulator before the import scenarios, and the system photo picker is automated through its own Page Object.
- **Tests against the release APK:** the JavaScript is bundled into the APK, so the tests do not depend on the development server and validate the same artifact end users install. The APK is reinstalled on every run.

Sample scenario (keywords in Portuguese: *Funcionalidade* = Feature, *Cenário* = Scenario, *Dado* = Given, *Então* = Then, *E* = And):

```gherkin
# language: pt
Funcionalidade: Tela inicial

  Cenário: Exibir o cofre vazio na primeira abertura
    Dado que o app foi aberto
    Então devo ver o título "Sticker Vault"
    E devo ver o subtítulo "Suas figurinhas guardadas e prontas para o WhatsApp."
    E devo ver a mensagem de cofre vazio "Seu cofre tá vazio."
```

## Troubleshooting

| Problem | Likely cause | Solution |
| --- | --- | --- |
| `expo prebuild` fails with `Project file "MainApplication" does not exist` | Project path contains accents or special characters | Move the project to a path without accents or spaces |
| Build fails in `buildCMake...` with `ninja: error: mkdir(...)` | CMake 3.31.6 not installed (long path on Windows) | Install CMake 3.31.6 through the SDK Manager |
| Tests cannot find any device | Emulator not running | Start the emulator and check with `adb devices` |
| `JAVA_HOME` or `ANDROID_HOME` not found | Missing environment variables | Set the variables and open a new terminal |

## Next steps

- Favorite and most-used stickers.
- Sticker maker with automatic background removal and text.
- Sharing drawers via QR code or file.
- Running the tests in continuous integration (GitHub Actions).

## Author

Thomas Teixeira — [github.com/ThomasTDS](https://github.com/ThomasTDS)
