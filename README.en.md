<p align="center">
  <img src="mobile/assets/images/brand/logo-source.png" alt="Sticker Vault logo" width="260" />
</p>

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
- [Continuous integration](#continuous-integration)
- [Troubleshooting](#troubleshooting)
- [Next steps](#next-steps)

## Status

Under active development. The initial roadmap is complete: drawers, gallery import, sending to WhatsApp, emojis and tags with search, favorites and most used, sticker maker and drawer sharing. Every feature has automated scenarios.

## Features

Sticker Vault is a vault for your stickers: each pack is a **drawer** (*gaveta*).

- **Drawers:** create them with a name and author, list them on the home screen and delete them with confirmation.
- **Gallery import:** pick several images at once through the Android photo picker.
- **WhatsApp format:** each image is cropped to a square, resized to 512x512 and saved as WebP of up to 100 KB.
- **WhatsApp limits:** 3 to 30 stickers per drawer; the app shows how many are missing to reach the minimum and blocks additions above the maximum.
- **Emojis and tags:** tap a sticker to pick up to 3 emojis (used by WhatsApp to suggest the sticker) and add comma-separated tags.
- **Search:** on the home screen, find stickers by emoji, tag or drawer name, ignoring case and accents.
- **Favorites:** mark stickers as favorites to see them on their own shelf on the home screen.
- **Single-sticker sharing:** send one sticker through the Android share sheet.
- **Most used:** the stickers shared most from the app show up on a home screen shelf, with their share count.
- **Removing stickers:** long-press a sticker.
- **Sending to WhatsApp:** with 3 or more stickers, the "Mandar pro WhatsApp" button opens WhatsApp's (or WhatsApp Business') own confirmation screen. The drawer icon (96x96) is generated from the first sticker.
- **Animated stickers:** create an animated drawer and turn short gallery videos and GIFs into animated stickers (512x512 animated WebP, up to 10 s and 500 KB), generated on the device with libwebp. For files longer than 10 s, you choose the segment while seeing its first and last frames.
- **Reply with a sticker:** pick a sticker that arrived on WhatsApp and the app suggests yours that fit as a reply. The received sticker's emojis are read from the metadata WhatsApp stores in the file (or picked by you when it has none) and go through a reply map (😂 calls for 😂🤣💀, 😭 calls for 🙏😭💔); suggestions are ordered by that map, then favorites and most used. Access to the received stickers folder is granted once, and everything is read on the device only.
- **Sticker maker:** pick a photo, remove the background automatically (ML Kit, processed on the device) and add top and bottom captions, with a live preview.
- **Sharing drawers:** generate a `.stickervault` file with the stickers, emojis and tags and send it through any app. The recipient can tap the file and choose Sticker Vault in "Open with", share the file with Sticker Vault through another app's "Share" menu (WhatsApp, Drive, Files, etc.) or use "Importar gaveta" on the home screen; received images are always re-encoded into the WhatsApp format.
- **Visual identity:** dark theme with a brown background, cream text, gold accents and the title in the Major Mono Display font.
- **Privacy:** no account and no ads; data stays on the device only (SQLite and local files).

## Tech stack

| Layer | Technologies |
| --- | --- |
| App | React Native, Expo (SDK 58), Expo Router, TypeScript, expo-sqlite, expo-image-picker, expo-image-manipulator, expo-sharing, Slider, ML Kit and libwebp (Kotlin/C via JNI) |
| Tests | WebdriverIO 10, Appium 3, UiAutomator2 driver, Cucumber (BDD), TypeScript |
| CI | GitHub Actions, Android emulator (android-emulator-runner), JUnit report |
| Platform | Android (distributed directly as an APK, no app store) |

## Repository structure

```
sticker-vault/
├── .github/workflows/       # Continuous integration pipeline (GitHub Actions)
├── mobile/                  # React Native app (Expo)
│   ├── src/app/             # Screens (Expo Router routes)
│   ├── src/components/      # Reusable UI components
│   ├── src/db/              # Local database (SQLite) and queries
│   ├── src/stickers/        # Sticker file conversion and storage
│   ├── src/theme/           # Light and dark theme colors
│   ├── modules/             # Local native modules (Kotlin): WhatsApp, sticker maker and sharing
│   ├── plugins/             # Expo config plugins for native adjustments
│   └── app.json             # App configuration
└── e2e/                     # End-to-end tests (Appium + WebdriverIO)
    ├── features/            # Gherkin scenarios (written in Portuguese)
    ├── step-definitions/    # Step implementations
    ├── pageobjects/         # Page Objects (app screens, photo picker and dialogs)
    ├── support/             # Device utilities (app reset, image upload)
    ├── fixtures/            # Images and video used by the tests
    ├── reports/             # Screenshots of failed steps (generated, not versioned)
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
| Favorites and most used | Mark a favorite; unmark a favorite; share through Android; most-used ordering |
| Animated drawers | Create an animated drawer; turn videos and GIFs into animated stickers; refuse a still photo; choose the segment of a long video or skip the file; share and receive it back keeping the animation |
| Reply with a sticker | Ask for access to received stickers only once; suggest replies from the received sticker's emojis, in reply-map order, and send them through Android; pick the emoji of a sticker without emojis; warn when no sticker fits |
| Sticker maker | Saving blocked without a photo; sticker with meme-style captions; remove and restore the background (`@modelo-ml`) |
| Sharing drawers | Share as a file; blocked for an empty drawer; import a received drawer with emojis; reject an invalid file |
| Open with | Open a drawer from the Android Files app; warn when the opened file is not a drawer |
| Receive through Share | Export a drawer and receive it back through the Android share sheet (round trip) |
| Emojis, tags and search | Pick emojis; 3-emoji limit; search by tag ignoring case and accents; search by emoji; search by drawer name; search with no results |

The sending scenarios run on an emulator without WhatsApp. The confirmation inside WhatsApp is validated manually on a real device:

1. Install the release APK on the phone (`adb install -r` with USB debugging enabled, or by copying the file to the device).
2. Create a drawer with at least 3 stickers.
3. Tap "Mandar pro WhatsApp" and confirm with "Add".
4. In WhatsApp, open the sticker panel and check that the drawer shows up with its icon and stickers.

The background removal scenario needs the ML Kit model, which Google Play services only downloads on devices with a Google account. That is why it is tagged `@modelo-ml` and excluded from the default run. To run it on a device with the model available:

```powershell
npm run test:modelo-ml
```

When a step fails, a screenshot of the device is saved to `e2e/reports/screenshots/`.

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

## Continuous integration

Every pull request to `main` is validated by GitHub Actions (`.github/workflows/ci.yml`), which can also be run manually from the **Actions** tab:

1. **Type checking:** `npm ci` and `npm run typecheck` in `mobile/` and `e2e/`.
2. **Android build and e2e tests:**
   - installs JDK 17 and CMake 3.31.6 and builds the release APK only for the emulator architecture (x86_64), published as an artifact;
   - starts an Android 14 emulator (API 34, `google_apis` image, the same one used locally) and runs the full suite;
   - publishes the test results on the pull request itself;
   - on failure, attaches the screenshots and Appium logs.

The `main` branch is protected: a pull request can only be merged once both CI checks pass.

After each merge, the workflow runs on `main` up to the build only, without the tests, to save the Gradle cache; the next pull requests start with the dependencies already downloaded.

On CI each feature gets one automatic retry to absorb emulator instability. The `@modelo-ml` scenario does not run on CI.

## Troubleshooting

| Problem | Likely cause | Solution |
| --- | --- | --- |
| `expo prebuild` fails with `Project file "MainApplication" does not exist` | Project path contains accents or special characters | Move the project to a path without accents or spaces |
| Build fails in `buildCMake...` with `ninja: error: mkdir(...)` | CMake 3.31.6 not installed (long path on Windows) | Install CMake 3.31.6 through the SDK Manager |
| Tests cannot find any device | Emulator not running | Start the emulator and check with `adb devices` |
| `JAVA_HOME` or `ANDROID_HOME` not found | Missing environment variables | Set the variables and open a new terminal |

## Next steps

- Split the e2e suite across two emulators running in parallel on CI.

## Author

Thomas Teixeira — [github.com/ThomasTDS](https://github.com/ThomasTDS)
