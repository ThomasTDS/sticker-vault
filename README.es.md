<p align="center">
  <img src="mobile/assets/images/brand/logo-source.png" alt="Logo de Sticker Vault" width="260" />
</p>

# Sticker Vault

[Português](README.md) | [English](README.en.md) | **Español**

Aplicación Android para guardar stickers de WhatsApp y añadirlos a WhatsApp en pocos toques, desarrollada junto con una suite de pruebas automatizadas con Appium.

Proyecto de estudio, sin fines de lucro, con dos objetivos: construir la aplicación y garantizar su calidad con pruebas de extremo a extremo desde la primera pantalla (enfoque *shift-left*).

## Índice

- [Estado](#estado)
- [Funcionalidades](#funcionalidades)
- [Tecnologías](#tecnologías)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos previos](#requisitos-previos)
- [Configuración del entorno](#configuración-del-entorno)
- [Ejecutar la aplicación](#ejecutar-la-aplicación)
- [Ejecutar las pruebas](#ejecutar-las-pruebas)
- [Estrategia de pruebas](#estrategia-de-pruebas)
- [Integración continua](#integración-continua)
- [Versiones publicadas](#versiones-publicadas)
- [Solución de problemas](#solución-de-problemas)
- [Próximos pasos](#próximos-pasos)

## Estado

En desarrollo activo. La hoja de ruta inicial está completa: cajones, importación desde la galería, envío a WhatsApp, emojis y etiquetas con búsqueda, favoritos y más usados, creador de stickers y uso compartido de cajones. Cada funcionalidad tiene escenarios automatizados.

## Funcionalidades

Sticker Vault es una caja fuerte para tus stickers: cada paquete es un **cajón** (*gaveta*).

- **Cajones:** créalos con nombre y autor, consúltalos en la pantalla de inicio y elimínalos con confirmación.
- **Importación desde la galería:** elige varias imágenes a la vez con el selector de fotos de Android.
- **Formato de WhatsApp:** cada imagen se recorta en cuadrado, se redimensiona a 512x512 y se guarda en WebP de hasta 100 KB.
- **Límites de WhatsApp:** de 3 a 30 stickers por cajón; la aplicación muestra cuántos faltan para llegar al mínimo y bloquea las adiciones por encima del máximo.
- **Emojis y etiquetas:** toca un sticker para elegir hasta 3 emojis (WhatsApp los usa para sugerir el sticker) y añadir etiquetas separadas por comas.
- **Búsqueda:** en la pantalla de inicio, encuentra stickers por emoji, etiqueta o nombre del cajón, sin distinguir mayúsculas ni acentos.
- **Favoritos:** marca stickers como favoritos para verlos en su propia sección de la pantalla de inicio.
- **Compartir un sticker:** envía un sticker a través del menú de compartir de Android.
- **Más usados:** los stickers que más se comparten desde la aplicación aparecen en una sección de la pantalla de inicio, con el número de envíos.
- **Eliminar stickers:** mantén pulsado un sticker.
- **Envío a WhatsApp:** con 3 stickers o más, el botón "Mandar pro WhatsApp" abre la pantalla de confirmación de WhatsApp (o WhatsApp Business). El icono del cajón (96x96) se genera a partir del primer sticker.
- **Stickers animados:** crea un cajón animado y convierte vídeos cortos y GIF de la galería en stickers animados (WebP animado de 512x512, hasta 10 s y 500 KB), generados en el dispositivo con libwebp. En los archivos de más de 10 s, eliges el fragmento viendo su primer y su último fotograma.
- **Responder con un sticker:** elige un sticker que llegó por WhatsApp y la aplicación sugiere los tuyos que encajan como respuesta. Los emojis del sticker recibido se leen de los metadatos que WhatsApp guarda en el archivo (o los eliges tú cuando no tiene ninguno) y pasan por un mapa de respuestas (😂 pide 😂🤣💀, 😭 pide 🙏😭💔); las sugerencias se ordenan según ese mapa y después por favoritos y más usados. Como WhatsApp solo envía como sticker lo que está en un paquete añadido a él, al tocar una sugerencia se muestra en qué cajón está, se ofrece añadir ese cajón a WhatsApp (si aún no está) y se abre WhatsApp con el emoji que hay que buscar en la pestaña de stickers; enviarlo como imagen sigue siendo una opción. El acceso a la carpeta de stickers recibidos se concede una sola vez, y todo se lee únicamente en el dispositivo.
- **Creador de stickers:** elige una foto, quita el fondo automáticamente (ML Kit, procesado en el dispositivo) y añade textos arriba y abajo, con vista previa en vivo.
- **Compartir cajones:** genera un archivo `.stickervault` con los stickers, emojis y etiquetas y envíalo por cualquier aplicación. Quien lo recibe puede tocar el archivo y elegir Sticker Vault en "Abrir con", compartir el archivo con Sticker Vault desde el menú "Compartir" de otra aplicación (WhatsApp, Drive, Archivos, etc.) o usar "Importar gaveta" en la pantalla de inicio; las imágenes recibidas siempre se vuelven a codificar en el formato de WhatsApp.
- **Identidad visual:** tema oscuro con fondo marrón, texto crema, detalles dorados y el título en la fuente Major Mono Display.
- **Privacidad:** sin cuenta y sin anuncios; los datos se quedan únicamente en el dispositivo (SQLite y archivos locales).

## Tecnologías

| Capa | Tecnologías |
| --- | --- |
| Aplicación | React Native, Expo (SDK 58), Expo Router, TypeScript, expo-sqlite, expo-image-picker, expo-image-manipulator, expo-sharing, Slider, ML Kit y libwebp (Kotlin/C vía JNI) |
| Pruebas | Unitarias: Jest (jest-expo) y JUnit 4 (Kotlin); e2e: WebdriverIO 10, Appium 3, driver UiAutomator2, Cucumber (BDD), TypeScript |
| CI | GitHub Actions, emulador Android (android-emulator-runner), informe JUnit |
| Plataforma | Android (distribución directa por APK, sin tienda de aplicaciones) |

## Estructura del repositorio

```
sticker-vault/
├── .github/workflows/       # Canalización de integración continua (GitHub Actions)
├── mobile/                  # Aplicación React Native (Expo)
│   ├── src/app/             # Pantallas (rutas de Expo Router)
│   ├── src/components/      # Componentes de interfaz reutilizables
│   ├── src/db/              # Base de datos local (SQLite) y consultas
│   ├── src/stickers/        # Conversión y almacenamiento de los archivos de stickers
│   ├── src/theme/           # Colores de los temas claro y oscuro
│   ├── modules/             # Módulos nativos locales (Kotlin): WhatsApp, creador de stickers y uso compartido
│   ├── plugins/             # Plugins de configuración de Expo para ajustes nativos
│   └── app.json             # Configuración de la aplicación
└── e2e/                     # Pruebas de extremo a extremo (Appium + WebdriverIO)
    ├── features/            # Escenarios en Gherkin (escritos en portugués)
    ├── step-definitions/    # Implementación de los pasos
    ├── pageobjects/         # Page Objects (pantallas de la aplicación, selector de fotos y diálogos)
    ├── support/             # Utilidades del dispositivo (reinicio de la aplicación, envío de imágenes)
    ├── fixtures/            # Imágenes y vídeo usados en las pruebas
    ├── reports/             # Capturas de los pasos fallidos (generadas, no versionadas)
    └── wdio.conf.ts         # Configuración de WebdriverIO y Appium
```

La aplicación y las pruebas tienen dependencias independientes: cada comando debe ejecutarse dentro de su carpeta (`mobile/` o `e2e/`).

La carpeta `mobile/android/` la genera automáticamente `expo prebuild` y no está versionada. Los ajustes nativos se hacen mediante plugins de configuración en `mobile/plugins/`.

## Requisitos previos

| Herramienta | Versión | Notas |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 24 o superior | Incluye npm |
| [JDK](https://learn.microsoft.com/java/openjdk/download) | 17 | Necesario para compilar Android |
| [Android Studio](https://developer.android.com/studio) | Última | Android SDK, emulador y herramientas de compilación |
| CMake (Android SDK) | 3.31.6 | Se instala con el SDK Manager, ver abajo |

El entorno de desarrollo es Windows, pero los pasos también valen para Linux y macOS, ajustando la sintaxis del terminal.

## Configuración del entorno

### 1. Variables de entorno

Define las variables siguientes (las rutas son ejemplos y pueden variar en tu equipo):

```powershell
# PowerShell (persistente para el usuario actual)
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot", "User")
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
```

Añade también `%ANDROID_HOME%\platform-tools` y `%ANDROID_HOME%\emulator` al `Path`. Abre un terminal nuevo y comprueba:

```powershell
java -version
adb version
```

### 2. CMake 3.31.6

Compilar bibliotecas con código C++ (como `react-native-screens`) requiere CMake. La versión predeterminada del Android SDK (3.22.1) incluye una versión de *ninja* que no admite rutas de más de 260 caracteres en Windows, lo que hace fallar la compilación. El proyecto está configurado para usar la versión **3.31.6**, que debe instalarse:

1. En Android Studio, abre **Settings → Languages & Frameworks → Android SDK → SDK Tools**.
2. Marca **Show Package Details**.
3. En **CMake**, selecciona la versión **3.31.6** y haz clic en **Apply**.

### 3. Emulador Android

En Android Studio, abre el **Device Manager** y crea un dispositivo virtual (por ejemplo, *Medium Phone* con una imagen de sistema reciente). Para iniciarlo desde el terminal:

```powershell
emulator -list-avds
emulator -avd <nombre_del_emulador>
```

Comprueba que el dispositivo está conectado:

```powershell
adb devices
```

### 4. Dependencias

```powershell
git clone https://github.com/ThomasTDS/sticker-vault.git
cd sticker-vault

cd mobile
npm install

cd ..\e2e
npm install
```

Appium y el driver UiAutomator2 se instalan localmente como dependencias de `e2e/`; no hace falta ninguna instalación global.

## Ejecutar la aplicación

### Generar el APK de release

Los comandos siguientes generan el proyecto nativo y el APK que usan las pruebas:

```powershell
cd mobile
npm run prebuild
cd android
.\gradlew.bat assembleRelease
```

El archivo se crea en `mobile/android/app/build/outputs/apk/release/app-release.apk`. La primera compilación puede tardar más de 10 minutos; las siguientes son más rápidas.

Para instalar el APK manualmente en el emulador o en un dispositivo conectado:

```powershell
adb install -r app\build\outputs\apk\release\app-release.apk
```

### Modo de desarrollo

Para desarrollar con recarga en vivo, usa la *development build*:

```powershell
cd mobile
npm run android   # compila e instala la development build en el emulador
npm start         # inicia el servidor Metro en las siguientes ejecuciones
```

### Comprobación de tipos

```powershell
cd mobile
npm run typecheck
```

## Ejecutar las pruebas

### Pruebas unitarias

Cubren las reglas que no necesitan dispositivo y se ejecutan en segundos, sin emulador:

```powershell
cd mobile
npm test
```

| Módulo | Qué se prueba |
| --- | --- |
| `src/stickers/reply-map.ts` | Emojis de respuesta en el orden del mapa, emojis fuera del mapa, el selector de variación (❤ y ❤️), orden de las sugerencias (mejor emoji, favoritos, más usados), límite de sugerencias y el emoji que hay que buscar en WhatsApp |
| `src/db/packs.ts` | Texto de búsqueda sin mayúsculas ni acentos; separación, recorte y eliminación de duplicados de las etiquetas |
| `src/stickers/pack-manifest.ts` | Validación del manifiesto `.stickervault` (formato, versión, nombre, lista de stickers), la cabecera del WebP animado (512x512, indicador de animación, límite de tamaño) y el nombre seguro para archivos |
| `StickerMetadata.kt` (módulo `whatsapp-stickers`) | Lectura de los emojis del bloque EXIF de un sticker recibido, bloques de tamaño impar, JSON sin emojis o dañado, archivos que no son WebP y bloques truncados |

Las pruebas del módulo nativo se ejecutan en la JVM, después de `prebuild`:

```powershell
cd mobile\android
.\gradlew :whatsapp-stickers:testDebugUnitTest
```

### Pruebas e2e

Con el emulador en marcha y el APK de release generado:

```powershell
cd e2e
npm test
```

WebdriverIO inicia el servidor Appium automáticamente, instala el APK en el dispositivo y ejecuta los escenarios de `e2e/features/`. Los registros de Appium se guardan en `e2e/logs/`.

Cobertura actual:

| Funcionalidad | Escenarios |
| --- | --- |
| Pantalla de inicio | Caja fuerte vacía en el primer inicio |
| Cajones | Crear un cajón; el cajón aparece en la pantalla de inicio; validación del nombre y el autor obligatorios; eliminar un cajón |
| Stickers de la galería | Añadir stickers; alcanzar el mínimo de WhatsApp; eliminar un sticker |
| Envío a WhatsApp | Envío bloqueado por debajo del mínimo; envío habilitado con 3 stickers; aviso de WhatsApp no instalado |
| Favoritos y más usados | Marcar un favorito; desmarcar un favorito; compartir por Android; orden de los más usados |
| Cajones animados | Crear un cajón animado; convertir vídeos y GIF en stickers animados; rechazar una foto fija; elegir el fragmento de un vídeo largo u omitir el archivo; compartir y recibir de vuelta manteniendo la animación |
| Responder con un sticker | Pedir acceso a los stickers recibidos una sola vez; sugerir respuestas a partir de los emojis del sticker recibido, en el orden del mapa; mostrar el cajón de la sugerencia, avisar de que WhatsApp no está instalado y enviarlo como imagen; elegir el emoji de un sticker sin emojis; avisar cuando ningún sticker encaja |
| Creador de stickers | Guardado bloqueado sin foto; sticker con textos estilo meme; quitar y restaurar el fondo (`@modelo-ml`) |
| Compartir cajones | Compartir como archivo; bloqueado para un cajón vacío; importar un cajón recibido con emojis; rechazar un archivo no válido |
| Abrir con | Abrir un cajón desde la aplicación Archivos de Android; avisar cuando el archivo abierto no es un cajón |
| Recibir por Compartir | Exportar un cajón y recibirlo de vuelta por el menú de compartir de Android (ida y vuelta) |
| Emojis, etiquetas y búsqueda | Elegir emojis; límite de 3 emojis; buscar por etiqueta sin distinguir mayúsculas ni acentos; buscar por emoji; buscar por nombre del cajón; búsqueda sin resultados |

Los escenarios de envío se ejecutan en un emulador sin WhatsApp. La confirmación dentro de WhatsApp se valida manualmente en un dispositivo real:

1. Instala el APK de release en el teléfono (`adb install -r` con la depuración USB activada, o copiando el archivo al dispositivo).
2. Crea un cajón con al menos 3 stickers.
3. Toca "Mandar pro WhatsApp" y confirma con "Añadir".
4. En WhatsApp, abre el panel de stickers y comprueba que el cajón aparece con su icono y sus stickers.

El escenario de eliminación del fondo necesita el modelo de ML Kit, que Google Play Services solo descarga en dispositivos con una cuenta de Google. Por eso lleva la etiqueta `@modelo-ml` y queda excluido de la ejecución predeterminada. Para ejecutarlo en un dispositivo con el modelo disponible:

```powershell
npm run test:modelo-ml
```

Cuando un paso falla, se guarda una captura del dispositivo en `e2e/reports/screenshots/`.

Para ejecutar una sola funcionalidad:

```powershell
npx wdio run ./wdio.conf.ts --spec ./features/gavetas.feature
```

Variables opcionales:

| Variable | Finalidad | Valor predeterminado |
| --- | --- | --- |
| `APK_PATH` | Ruta a otro APK que se quiera probar | APK de release en `mobile/android/...` |
| `DEVICE_NAME` | Nombre del dispositivo enviado a Appium | `Android Emulator` |

Ejemplo:

```powershell
$env:APK_PATH = "C:\ruta\a\app.apk"; npm test
```

Para comprobar los tipos del proyecto de pruebas:

```powershell
npm run typecheck
```

## Estrategia de pruebas

- **Shift-left:** cada nueva funcionalidad de la aplicación se entrega junto con sus escenarios automatizados.
- **Pirámide de pruebas:** las reglas puras (mapa de respuestas, búsqueda, validación de archivos, lectura de metadatos) se cubren con pruebas unitarias, que dan respuesta en segundos; los escenarios e2e validan los flujos en el dispositivo. Para ello, la lógica se mantiene separada del acceso a archivos y a la base de datos (por ejemplo, `pack-manifest.ts` separado de `pack-transfer.ts`, y `StickerMetadata` separado de `ReceivedStickers`).
- **BDD con Cucumber:** los escenarios se escriben en Gherkin, en portugués (`# language: pt`), y sirven como documentación viva del comportamiento de la aplicación.
- **Page Objects:** los selectores y las acciones de cada pantalla están en sus propias clases en `e2e/pageobjects/`; los pasos solo llaman a esos métodos.
- **Selectores estables:** cada elemento comprobado por las pruebas recibe un `testID` en la aplicación. En Android, el `testID` se expone como `resource-id`, y el método `byTestId()` de `BasePage` localiza los elementos con él.
- **Escenarios independientes:** los datos de la aplicación se borran antes de cada escenario (`mobile: clearApp`), de modo que ninguna prueba depende de otra.
- **Galería controlada:** las imágenes de `e2e/fixtures/images/` se envían al emulador antes de los escenarios de importación, y el selector de fotos del sistema se automatiza con su propio Page Object.
- **Pruebas sobre el APK de release:** el JavaScript va empaquetado en el APK, así que las pruebas no dependen del servidor de desarrollo y validan el mismo artefacto que instalan los usuarios finales. El APK se reinstala en cada ejecución.

Ejemplo de escenario (palabras clave en portugués: *Funcionalidade* = Característica, *Cenário* = Escenario, *Dado* = Dado, *Então* = Entonces, *E* = Y):

```gherkin
# language: pt
Funcionalidade: Tela inicial

  Cenário: Exibir o cofre vazio na primeira abertura
    Dado que o app foi aberto
    Então devo ver o título "Sticker Vault"
    E devo ver o subtítulo "Suas figurinhas guardadas e prontas para o WhatsApp."
    E devo ver a mensagem de cofre vazio "Seu cofre tá vazio."
```

## Integración continua

Cada pull request a `main` se valida con GitHub Actions (`.github/workflows/ci.yml`), que también puede ejecutarse manualmente desde la pestaña **Actions**:

1. **Comprobación de tipos:** `npm ci` y `npm run typecheck` en `mobile/` y `e2e/`.
2. **Pruebas unitarias:** Jest para la aplicación y JUnit para el módulo nativo `whatsapp-stickers`, en paralelo con la compilación.
3. **Compilación Android:** instala JDK 17 y CMake 3.31.6 y genera el APK de release solo para la arquitectura del emulador (x86_64), publicado como artefacto.
4. **Pruebas e2e (1/2 y 2/2):** la suite se reparte entre dos emuladores Android 14 (API 34, imagen `google_apis`, la misma que se usa localmente) que se ejecutan al mismo tiempo, cada uno con el APK generado en el paso anterior:
   - la primera mitad ejecuta las funcionalidades listadas en `e2e/wdio.conf.ts` (`E2E_SHARD=1`) y la segunda todas las demás, de modo que una funcionalidad nueva entra sola en la segunda mitad;
   - cada mitad publica sus resultados en el propio pull request;
   - si hay fallos, adjunta las capturas y los registros de Appium.
5. **Build Android e testes e2e:** resume los pasos 2, 3 y 4 en una sola comprobación.

La rama `main` está protegida: un pull request solo puede fusionarse cuando pasan las comprobaciones **Verificação de tipos** y **Build Android e testes e2e**.

Después de cada fusión, el workflow se ejecuta en `main` hasta la compilación y las pruebas unitarias, sin las pruebas e2e, para guardar la caché de Gradle; los siguientes pull requests empiezan con las dependencias ya descargadas.

En CI, cada funcionalidad tiene un reintento automático para absorber la inestabilidad del emulador. El escenario `@modelo-ml` no se ejecuta en CI.

## Versiones publicadas

Cada versión está en la pestaña **Releases** de GitHub, con un APK listo para instalar en cualquier teléfono Android. Crear una etiqueta en `main` activa `.github/workflows/release.yml`:

```powershell
git checkout main
git pull
git tag v1.0.0
git push origin v1.0.0
```

El workflow comprueba que la etiqueta está en `main`, ejecuta las pruebas de la aplicación, genera el APK con las 4 arquitecturas, lo firma, comprueba la firma y publica la Release con notas generadas a partir de los pull requests. La etiqueta es el único lugar donde se escribe la versión: `v1.2.3` se convierte en `versionName` 1.2.3 y `versionCode` 10203.

La clave de firma queda fuera del repositorio, en los secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` y `ANDROID_KEY_PASSWORD`. Fuera del workflow de versiones (compilaciones locales y de pull requests), el APK sigue usando la clave de depuración.

## Solución de problemas

| Problema | Causa probable | Solución |
| --- | --- | --- |
| `expo prebuild` falla con `Project file "MainApplication" does not exist` | La ruta del proyecto contiene acentos o caracteres especiales | Mueve el proyecto a una ruta sin acentos ni espacios |
| La compilación falla en `buildCMake...` con `ninja: error: mkdir(...)` | CMake 3.31.6 no instalado (ruta larga en Windows) | Instala CMake 3.31.6 con el SDK Manager |
| Las pruebas no encuentran ningún dispositivo | Emulador apagado | Inicia el emulador y comprueba con `adb devices` |
| `JAVA_HOME` o `ANDROID_HOME` no encontrados | Faltan variables de entorno | Define las variables y abre un terminal nuevo |

## Próximos pasos

- Reutilizar un snapshot del emulador entre ejecuciones de CI para acortar el arranque.

## Autor

Thomas Teixeira — [github.com/ThomasTDS](https://github.com/ThomasTDS)
