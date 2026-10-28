# Sticker Vault

**Português** | [English](README.en.md)

Aplicativo Android para guardar figurinhas do WhatsApp e adicioná-las ao aplicativo em poucos cliques, desenvolvido junto com uma suíte de testes automatizados com Appium.

Projeto de estudo, sem fins lucrativos, com dois objetivos: construir o aplicativo e garantir sua qualidade com testes de ponta a ponta desde a primeira tela (abordagem *shift-left*).

## Sumário

- [Status](#status)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Executando o aplicativo](#executando-o-aplicativo)
- [Executando os testes](#executando-os-testes)
- [Estratégia de testes](#estratégia-de-testes)
- [Solução de problemas](#solução-de-problemas)
- [Próximos passos](#próximos-passos)

## Status

Em desenvolvimento. Já é possível criar gavetas (pacotes), guardar figurinhas importadas da galeria e mandar as gavetas para o WhatsApp. Também é possível classificar as figurinhas com emojis e tags e buscá-las no cofre. As figurinhas favoritas e as mais compartilhadas ficam à mão na tela inicial. A próxima etapa é o criador de figurinhas.

## Funcionalidades

O Sticker Vault é o cofre das suas figurinhas: cada pacote é uma **gaveta**.

- **Gavetas:** criação com nome e autor, listagem na tela inicial e exclusão com confirmação.
- **Importação da galeria:** seleção de várias imagens de uma vez pelo seletor de fotos do Android.
- **Formato do WhatsApp:** cada imagem é recortada em quadrado, redimensionada para 512x512 e salva em WebP com até 100 KB.
- **Limites do WhatsApp:** de 3 a 30 figurinhas por gaveta; o app avisa quantas faltam para o mínimo e bloqueia acima do máximo.
- **Emojis e tags:** ao tocar numa figurinha, escolha até 3 emojis (usados pelo WhatsApp para sugerir a figurinha) e adicione tags separadas por vírgula.
- **Busca:** na tela inicial, encontre figurinhas por emoji, tag ou nome da gaveta, sem diferenciar maiúsculas e acentos.
- **Favoritas:** marque figurinhas como favoritas para vê-las numa prateleira própria na tela inicial.
- **Compartilhamento avulso:** mande uma figurinha sozinha pelo menu de compartilhamento do Android.
- **Mais usadas:** as figurinhas mais compartilhadas pelo app aparecem numa prateleira da tela inicial, com a quantidade de compartilhamentos.
- **Remoção de figurinhas:** toque longo sobre a figurinha.
- **Envio para o WhatsApp:** com 3 ou mais figurinhas, o botão "Mandar pro WhatsApp" abre a confirmação do próprio WhatsApp (ou do WhatsApp Business). O ícone da gaveta (96x96) é gerado a partir da primeira figurinha.
- **Privacidade:** sem conta e sem anúncios; os dados ficam apenas no aparelho (SQLite e arquivos locais).

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Aplicativo | React Native, Expo (SDK 58), Expo Router, TypeScript, expo-sqlite, expo-image-picker, expo-image-manipulator, expo-sharing |
| Testes | WebdriverIO 10, Appium 3, driver UiAutomator2, Cucumber (BDD), TypeScript |
| Plataforma | Android (distribuição direta por APK, sem loja) |

## Estrutura do repositório

```
sticker-vault/
├── mobile/                  # Aplicativo React Native (Expo)
│   ├── src/app/             # Telas (rotas do Expo Router)
│   ├── src/components/      # Componentes reutilizáveis de interface
│   ├── src/db/              # Banco de dados local (SQLite) e consultas
│   ├── src/stickers/        # Conversão e armazenamento dos arquivos das figurinhas
│   ├── src/theme/           # Cores dos temas claro e escuro
│   ├── modules/             # Módulos nativos locais (Kotlin), como a integração com o WhatsApp
│   ├── plugins/             # Config plugins do Expo para ajustes nativos
│   └── app.json             # Configuração do aplicativo
└── e2e/                     # Testes de ponta a ponta (Appium + WebdriverIO)
    ├── features/            # Cenários em Gherkin (português)
    ├── step-definitions/    # Implementação dos passos dos cenários
    ├── pageobjects/         # Page Objects (telas do app, seletor de fotos e diálogos)
    ├── support/             # Utilitários de dispositivo (limpeza do app, envio de imagens)
    ├── fixtures/            # Imagens usadas nos testes
    └── wdio.conf.ts         # Configuração do WebdriverIO e do Appium
```

O aplicativo e os testes têm dependências independentes: cada comando deve ser executado dentro da pasta correspondente (`mobile/` ou `e2e/`).

A pasta `mobile/android/` é gerada automaticamente pelo `expo prebuild` e não é versionada. Ajustes nativos são feitos por meio de config plugins em `mobile/plugins/`.

## Pré-requisitos

| Ferramenta | Versão | Observação |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 24 ou superior | Inclui o npm |
| [JDK](https://learn.microsoft.com/java/openjdk/download) | 17 | Necessário para o build Android |
| [Android Studio](https://developer.android.com/studio) | Atual | Android SDK, emulador e ferramentas de build |
| CMake (Android SDK) | 3.31.6 | Instalado pelo SDK Manager, veja abaixo |

O ambiente de desenvolvimento utilizado é Windows, mas os passos também se aplicam a Linux e macOS, com os ajustes de sintaxe do terminal.

## Configuração do ambiente

### 1. Variáveis de ambiente

Configure as variáveis abaixo (os caminhos são exemplos e podem variar na sua máquina):

```powershell
# PowerShell (permanente para o usuário atual)
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Microsoft\jdk-17.0.21.21-hotspot", "User")
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
```

Adicione também ao `Path` as pastas `%ANDROID_HOME%\platform-tools` e `%ANDROID_HOME%\emulator`. Abra um novo terminal e confirme:

```powershell
java -version
adb version
```

### 2. CMake 3.31.6

O build de bibliotecas com código C++ (como `react-native-screens`) depende do CMake. A versão padrão do Android SDK (3.22.1) acompanha uma versão do *ninja* que não suporta caminhos com mais de 260 caracteres no Windows, o que faz o build falhar. O projeto está configurado para usar a versão **3.31.6**, que precisa estar instalada:

1. No Android Studio, abra **Settings → Languages & Frameworks → Android SDK → SDK Tools**.
2. Marque **Show Package Details**.
3. Em **CMake**, selecione a versão **3.31.6** e clique em **Apply**.

### 3. Emulador Android

No Android Studio, abra o **Device Manager** e crie um dispositivo virtual (por exemplo, *Medium Phone* com uma imagem de sistema recente). Para iniciá-lo pelo terminal:

```powershell
emulator -list-avds
emulator -avd <nome_do_emulador>
```

Confirme que o dispositivo está conectado:

```powershell
adb devices
```

### 4. Dependências

```powershell
git clone https://github.com/ThomasTDS/sticker-vault.git
cd sticker-vault

cd mobile
npm install

cd ..\e2e
npm install
```

O Appium e o driver UiAutomator2 são instalados localmente como dependências de `e2e/`, sem necessidade de instalação global.

## Executando o aplicativo

### Gerar o APK de release

Os comandos abaixo geram o projeto nativo e o APK que é utilizado pelos testes:

```powershell
cd mobile
npm run prebuild
cd android
.\gradlew.bat assembleRelease
```

O arquivo é gerado em `mobile/android/app/build/outputs/apk/release/app-release.apk`. O primeiro build pode levar mais de 10 minutos; os seguintes são mais rápidos.

Para instalar o APK manualmente no emulador ou em um dispositivo conectado:

```powershell
adb install -r app\build\outputs\apk\release\app-release.apk
```

### Modo de desenvolvimento

Para desenvolver com recarregamento automático, use o *development build*:

```powershell
cd mobile
npm run android   # compila e instala o build de desenvolvimento no emulador
npm start         # inicia o servidor do Metro nas execuções seguintes
```

### Verificação de tipos

```powershell
cd mobile
npm run typecheck
```

## Executando os testes

Com o emulador ligado e o APK de release gerado:

```powershell
cd e2e
npm test
```

O WebdriverIO inicia o servidor do Appium automaticamente, instala o APK no dispositivo e executa os cenários de `e2e/features/`. Os logs do Appium ficam em `e2e/logs/`.

Cobertura atual:

| Funcionalidade | Cenários |
| --- | --- |
| Tela inicial | Cofre vazio na primeira abertura |
| Gavetas | Criar gaveta; gaveta aparece na tela inicial; validação de nome e autor obrigatórios; excluir gaveta |
| Figurinhas da galeria | Adicionar figurinhas; completar o mínimo para o WhatsApp; remover figurinha |
| Envio para o WhatsApp | Envio bloqueado abaixo do mínimo; envio liberado com 3 figurinhas; aviso de WhatsApp não instalado |
| Favoritas e mais usadas | Favoritar; desfazer favorita; compartilhar pelo Android; ordenação das mais usadas |
| Emojis, tags e busca | Escolher emojis; limite de 3 emojis; busca por tag ignorando maiúsculas e acentos; busca por emoji; busca pelo nome da gaveta; busca sem resultados |

Os cenários de envio rodam em um emulador sem o WhatsApp. A confirmação dentro do WhatsApp é validada manualmente em um aparelho real:

1. Instale o APK de release no celular (`adb install -r` com depuração USB ativada, ou enviando o arquivo para o aparelho).
2. Crie uma gaveta com pelo menos 3 figurinhas.
3. Toque em "Mandar pro WhatsApp" e confirme em "Adicionar".
4. No WhatsApp, abra o painel de figurinhas e confira se a gaveta aparece com o ícone e as figurinhas.

Para executar apenas uma funcionalidade:

```powershell
npx wdio run ./wdio.conf.ts --spec ./features/gavetas.feature
```

Variáveis opcionais:

| Variável | Uso | Padrão |
| --- | --- | --- |
| `APK_PATH` | Caminho de outro APK a ser testado | APK de release em `mobile/android/...` |
| `DEVICE_NAME` | Nome do dispositivo informado ao Appium | `Android Emulator` |

Exemplo:

```powershell
$env:APK_PATH = "C:\caminho\para\app.apk"; npm test
```

Para verificar os tipos do projeto de testes:

```powershell
npm run typecheck
```

## Estratégia de testes

- **Shift-left:** cada funcionalidade nova do aplicativo é entregue junto com seus cenários automatizados.
- **BDD com Cucumber:** os cenários são escritos em Gherkin, em português (`# language: pt`), e servem como documentação viva do comportamento do aplicativo.
- **Page Objects:** seletores e ações de cada tela ficam em classes próprias em `e2e/pageobjects/`; os passos apenas chamam esses métodos.
- **Seletores estáveis:** todo elemento verificado pelos testes recebe um `testID` no aplicativo. No Android, o `testID` é exposto como `resource-id`, e o método `byTestId()` da `BasePage` localiza o elemento por ele.
- **Cenários independentes:** antes de cada cenário, os dados do app são apagados (`mobile: clearApp`), garantindo que um teste não dependa do outro.
- **Galeria controlada:** as imagens de `e2e/fixtures/images/` são enviadas ao emulador antes dos cenários de importação, e o seletor de fotos do sistema é automatizado por um Page Object próprio.
- **Testes sobre o APK de release:** o JavaScript já vem embutido no APK, então os testes não dependem do servidor de desenvolvimento e validam o mesmo artefato que o usuário final instala. O APK é reinstalado a cada execução.

Exemplo de cenário:

```gherkin
# language: pt
Funcionalidade: Tela inicial

  Cenário: Exibir o cofre vazio na primeira abertura
    Dado que o app foi aberto
    Então devo ver o título "Sticker Vault"
    E devo ver o subtítulo "Suas figurinhas guardadas e prontas para o WhatsApp."
    E devo ver a mensagem de cofre vazio "Seu cofre tá vazio."
```

## Solução de problemas

| Problema | Causa provável | Solução |
| --- | --- | --- |
| `expo prebuild` falha com `Project file "MainApplication" does not exist` | Caminho do projeto com acentos ou caracteres especiais | Mova o projeto para um caminho sem acentos e sem espaços |
| Build falha em `buildCMake...` com `ninja: error: mkdir(...)` | CMake 3.31.6 não instalado (caminho longo no Windows) | Instale o CMake 3.31.6 pelo SDK Manager |
| Testes não encontram nenhum dispositivo | Emulador desligado | Inicie o emulador e confirme com `adb devices` |
| `JAVA_HOME` ou `ANDROID_HOME` não encontrados | Variáveis de ambiente ausentes | Configure as variáveis e abra um novo terminal |

## Próximos passos

- Criador de figurinhas com recorte automático de fundo e texto.
- Compartilhamento de gavetas por QR code ou arquivo.
- Execução dos testes em integração contínua (GitHub Actions).

## Autor

Thomas Teixeira — [github.com/ThomasTDS](https://github.com/ThomasTDS)
