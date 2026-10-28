const { withSettingsGradle } = require('expo/config-plugins');

// Força a versão do CMake em todos os módulos Android (app e bibliotecas).
// O CMake 3.22.1 padrão usa o ninja 1.10, que falha no Windows com caminhos
// acima de 260 caracteres; a partir do ninja 1.12 há suporte a caminhos longos.
// Fica no settings.gradle para ser aplicado antes de qualquer módulo ser configurado.
const MARKER = '// with-cmake-version';

function withCmakeVersion(config, { version }) {
  return withSettingsGradle(config, (config) => {
    if (config.modResults.contents.includes(MARKER)) {
      return config;
    }

    config.modResults.contents += `
${MARKER}
gradle.beforeProject { project ->
  ['com.android.application', 'com.android.library'].each { pluginId ->
    project.plugins.withId(pluginId) {
      project.extensions.getByName('android').externalNativeBuild.cmake.version = '${version}'
    }
  }
}
`;
    return config;
  });
}

module.exports = withCmakeVersion;
