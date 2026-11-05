const { withAppBuildGradle } = require('expo/config-plugins');

// Signs the release APK with the keystore given by the environment (ANDROID_KEYSTORE_PATH and the passwords),
// which only the release workflow has. Without it, as on local and pull request builds, the debug key is kept.
const MARKER = '// with-release-signing';
const DEBUG_SIGNING = /(see https:\/\/reactnative\.dev\/docs\/signed-apk-android\.\s*\n\s*)signingConfig signingConfigs\.debug/;
const SIGNING_CONFIGS = /signingConfigs\s*\{\s*\n/;

function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    const { contents } = config.modResults;
    if (contents.includes(MARKER)) {
      return config;
    }
    if (!DEBUG_SIGNING.test(contents) || !SIGNING_CONFIGS.test(contents)) {
      throw new Error('with-release-signing: the signing section of app/build.gradle was not recognized');
    }

    config.modResults.contents = contents
      .replace(
        SIGNING_CONFIGS,
        (match) => `${match}        ${MARKER}
        release {
            if (System.getenv('ANDROID_KEYSTORE_PATH')) {
                storeFile file(System.getenv('ANDROID_KEYSTORE_PATH'))
                storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
                keyAlias System.getenv('ANDROID_KEY_ALIAS')
                keyPassword System.getenv('ANDROID_KEY_PASSWORD')
            }
        }
`,
      )
      .replace(
        DEBUG_SIGNING,
        "$1signingConfig System.getenv('ANDROID_KEYSTORE_PATH') ? signingConfigs.release : signingConfigs.debug",
      );
    return config;
  });
}

module.exports = withReleaseSigning;
