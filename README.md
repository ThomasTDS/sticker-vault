<p align="center">
  <img src="mobile/assets/images/brand/logo-source.png" alt="Logo do Sticker Vault" width="260" />
</p>

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
- [Integração contínua](#integração-contínua)
- [Solução de problemas](#solução-de-problemas)
- [Próximos passos](#próximos-passos)

## Status

Em desenvolvimento ativo. O roadmap inicial está completo: gavetas, importação da galeria, envio ao WhatsApp, emojis e tags com busca, favoritas e mais usadas, criador de figurinhas e compartilhamento de gavetas. Todas as funcionalidades têm cenários automatizados.

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
- **Figurinhas animadas:** crie uma gaveta animada e transforme vídeos curtos e GIFs da galeria em figurinhas animadas (WebP animado de 512x512, até 10 s e 500 KB), geradas no próprio aparelho com a libwebp. Para arquivos com mais de 10 s, você escolhe o trecho vendo o primeiro e o último quadro.
- **Responder figurinha:** escolha uma figurinha que chegou no WhatsApp e o app sugere as suas que combinam como resposta. Os emojis da figurinha recebida são lidos dos metadados que o WhatsApp grava no arquivo (ou escolhidos por você, quando ela não tem) e passam por um mapa de respostas (😂 pede 😂🤣💀, 😭 pede 🙏😭💔); as sugestões vêm ordenadas por esse mapa, depois favoritas e mais usadas. Como o WhatsApp só manda como figurinha o que está numa gaveta adicionada a ele, tocar numa sugestão mostra em qual gaveta ela está, oferece pôr a gaveta no WhatsApp (se ainda não estiver) e abre o WhatsApp com a dica do emoji a buscar na aba de figurinhas; mandar como imagem continua como opção. O acesso à pasta de figurinhas recebidas é dado uma única vez, e tudo é lido só no aparelho.
- **Criador de figurinhas:** escolha uma foto, remova o fundo automaticamente (ML Kit, processado no próprio aparelho) e escreva textos em cima e embaixo, com prévia ao vivo.
- **Compartilhar gavetas:** gere um arquivo `.stickervault` com as figurinhas, emojis e tags e mande por qualquer app. Quem recebe pode tocar no arquivo e escolher o Sticker Vault em "Abrir com", compartilhar o arquivo com o Sticker Vault pelo menu "Compartilhar" de outro app (WhatsApp, Drive, Arquivos etc.) ou usar "Importar gaveta" na tela inicial; as imagens recebidas são sempre reprocessadas para o formato do WhatsApp.
- **Identidade visual:** tema escuro com fundo marrom, textos em creme, detalhes em dourado e o título na fonte Major Mono Display.
- **Privacidade:** sem conta e sem anúncios; os dados ficam apenas no aparelho (SQLite e arquivos locais).

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Aplicativo | React Native, Expo (SDK 58), Expo Router, TypeScript, expo-sqlite, expo-image-picker, expo-image-manipulator, expo-sharing, Slider, ML Kit e libwebp (Kotlin/C via JNI) |
| Testes | Unitários: Jest (jest-expo) e JUnit 4 (Kotlin); e2e: WebdriverIO 10, Appium 3, driver UiAutomator2, Cucumber (BDD), TypeScript |
| CI | GitHub Actions, emulador Android (android-emulator-runner), relatório JUnit |
| Plataforma | Android (distribuição direta por APK, sem loja) |

## Estrutura do repositório

```
sticker-vault/
├── .github/workflows/       # Pipeline de integração contínua (GitHub Actions)
├── mobile/                  # Aplicativo React Native (Expo)
│   ├── src/app/             # Telas (rotas do Expo Router)
│   ├── src/components/      # Componentes reutilizáveis de interface
│   ├── src/db/              # Banco de dados local (SQLite) e consultas
│   ├── src/stickers/        # Conversão e armazenamento dos arquivos das figurinhas
│   ├── src/theme/           # Cores dos temas claro e escuro
│   ├── modules/             # Módulos nativos locais (Kotlin): WhatsApp, criador de figurinhas e compartilhamento
│   ├── plugins/             # Config plugins do Expo para ajustes nativos
│   └── app.json             # Configuração do aplicativo
└── e2e/                     # Testes de ponta a ponta (Appium + WebdriverIO)
    ├── features/            # Cenários em Gherkin (português)
    ├── step-definitions/    # Implementação dos passos dos cenários
    ├── pageobjects/         # Page Objects (telas do app, seletor de fotos e diálogos)
    ├── support/             # Utilitários de dispositivo (limpeza do app, envio de imagens)
    ├── fixtures/            # Imagens e vídeo usados nos testes
    ├── reports/             # Capturas de tela de passos que falharam (gerado, não versionado)
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

### Testes unitários

Cobrem as regras que não precisam de aparelho e rodam em segundos, sem emulador:

```powershell
cd mobile
npm test
```

| Módulo | O que é testado |
| --- | --- |
| `src/stickers/reply-map.ts` | Emojis de resposta na ordem do mapa, emoji fora do mapa, seletor de variação (❤ e ❤️), ordem das sugestões (melhor emoji, favoritas, mais usadas), limite de sugestões e emoji a buscar no WhatsApp |
| `src/db/packs.ts` | Texto de busca sem maiúsculas e acentos; separação, limpeza e remoção de tags repetidas |
| `src/stickers/pack-manifest.ts` | Validação do manifesto do arquivo `.stickervault` (formato, versão, nome, lista de figurinhas), cabeçalho do WebP animado (512x512, marca de animação, limite de tamanho) e nome seguro para o arquivo |
| `StickerMetadata.kt` (módulo `whatsapp-stickers`) | Leitura dos emojis no bloco EXIF da figurinha recebida, blocos de tamanho ímpar, JSON sem emojis ou quebrado, arquivo que não é WebP e bloco truncado |

Os testes do módulo nativo rodam na JVM, depois do `prebuild`:

```powershell
cd mobile\android
.\gradlew :whatsapp-stickers:testDebugUnitTest
```

### Testes e2e

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
| Gavetas animadas | Criar gaveta animada; transformar vídeos e GIFs em figurinhas animadas; recusar foto parada; escolher o trecho de vídeo longo ou pular o arquivo; compartilhar e receber de volta mantendo a animação |
| Responder figurinha | Pedir acesso às figurinhas recebidas uma única vez; sugerir respostas pelos emojis da figurinha recebida, na ordem do mapa; mostrar a gaveta da sugestão, avisar que o WhatsApp não está instalado e mandar como imagem; escolher o emoji de uma figurinha sem emojis; avisar quando nenhuma figurinha combina |
| Criador de figurinhas | Salvamento bloqueado sem foto; figurinha com texto estilo meme; remover e restaurar o fundo (`@modelo-ml`) |
| Compartilhamento de gavetas | Compartilhar como arquivo; bloqueio em gaveta vazia; importar gaveta recebida com emojis; recusar arquivo inválido |
| Abrir com | Abrir gaveta pelo app Arquivos do Android; avisar quando o arquivo aberto não é uma gaveta |
| Receber pelo menu Compartilhar | Exportar a gaveta e recebê-la de volta pelo menu de compartilhamento do Android (ida e volta) |
| Emojis, tags e busca | Escolher emojis; limite de 3 emojis; busca por tag ignorando maiúsculas e acentos; busca por emoji; busca pelo nome da gaveta; busca sem resultados |

Os cenários de envio rodam em um emulador sem o WhatsApp. A confirmação dentro do WhatsApp é validada manualmente em um aparelho real:

1. Instale o APK de release no celular (`adb install -r` com depuração USB ativada, ou enviando o arquivo para o aparelho).
2. Crie uma gaveta com pelo menos 3 figurinhas.
3. Toque em "Mandar pro WhatsApp" e confirme em "Adicionar".
4. No WhatsApp, abra o painel de figurinhas e confira se a gaveta aparece com o ícone e as figurinhas.

O cenário de remoção de fundo precisa do modelo do ML Kit, que o Google Play Services só baixa em aparelhos com conta Google. Por isso ele tem a tag `@modelo-ml` e fica fora da execução padrão. Para rodá-lo em um aparelho com o modelo disponível:

```powershell
npm run test:modelo-ml
```

Quando um passo falha, uma captura da tela do aparelho é salva em `e2e/reports/screenshots/`.

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
- **Pirâmide de testes:** regras puras (mapa de respostas, busca, validação de arquivos, leitura de metadados) são cobertas por testes unitários, que dão retorno em segundos; os cenários e2e validam os fluxos no aparelho. Para isso, a lógica é separada do acesso a arquivos e banco (por exemplo, `pack-manifest.ts` fora de `pack-transfer.ts`, e `StickerMetadata` fora de `ReceivedStickers`).
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

## Integração contínua

Todo pull request para a `main` é validado pelo GitHub Actions (`.github/workflows/ci.yml`), que também pode ser executado manualmente pela aba **Actions**:

1. **Verificação de tipos:** `npm ci` e `npm run typecheck` em `mobile/` e `e2e/`.
2. **Testes unitários:** Jest no app e JUnit no módulo nativo `whatsapp-stickers`, em paralelo com o build.
3. **Build Android:** instala o JDK 17 e o CMake 3.31.6 e gera o APK de release só para a arquitetura do emulador (x86_64), publicado como artefato.
4. **Testes e2e (1/2 e 2/2):** a suíte é dividida entre dois emuladores Android 14 (API 34, imagem `google_apis`, a mesma usada localmente) que rodam ao mesmo tempo, cada um com o APK gerado no passo anterior:
   - a primeira metade roda as funcionalidades listadas em `e2e/wdio.conf.ts` (`E2E_SHARD=1`) e a segunda roda todas as outras, então uma funcionalidade nova entra sozinha na segunda;
   - cada metade publica o resultado dos testes no próprio pull request;
   - em caso de falha, anexa as capturas de tela e os logs do Appium.
5. **Build Android e testes e2e:** resume os passos 2, 3 e 4 num único check.

A branch `main` é protegida: o merge de um pull request só é liberado com os checks **Verificação de tipos** e **Build Android e testes e2e** aprovados.

Depois de cada merge, o workflow roda na `main` só até o build e os testes unitários, sem os e2e, para salvar o cache do Gradle; os pull requests seguintes começam com as dependências já baixadas.

No CI, cada funcionalidade tem uma nova tentativa automática para absorver instabilidades do emulador. O cenário `@modelo-ml` não roda no CI.

## Solução de problemas

| Problema | Causa provável | Solução |
| --- | --- | --- |
| `expo prebuild` falha com `Project file "MainApplication" does not exist` | Caminho do projeto com acentos ou caracteres especiais | Mova o projeto para um caminho sem acentos e sem espaços |
| Build falha em `buildCMake...` com `ninja: error: mkdir(...)` | CMake 3.31.6 não instalado (caminho longo no Windows) | Instale o CMake 3.31.6 pelo SDK Manager |
| Testes não encontram nenhum dispositivo | Emulador desligado | Inicie o emulador e confirme com `adb devices` |
| `JAVA_HOME` ou `ANDROID_HOME` não encontrados | Variáveis de ambiente ausentes | Configure as variáveis e abra um novo terminal |

## Próximos passos

- Reaproveitar um snapshot do emulador entre execuções do CI para encurtar a inicialização.

## Autor

Thomas Teixeira — [github.com/ThomasTDS](https://github.com/ThomasTDS)
