# language: pt
Funcionalidade: Compartilhamento de gavetas
  Como usuário do Sticker Vault
  Quero mandar minhas gavetas para amigos e receber as deles
  Para que todo mundo tenha as mesmas figurinhas

  Contexto:
    Dado que o app foi aberto

  Cenário: Compartilhar uma gaveta como arquivo
    Dado que existe a gaveta "Reações" com o autor "Thomas"
    E que eu adicionei 3 imagens da galeria
    Quando eu compartilho a gaveta
    Então o seletor de compartilhamento do Android deve abrir

  Cenário: Bloquear o compartilhamento de uma gaveta vazia
    Dado que existe a gaveta "Vazia" com o autor "Thomas"
    Então o botão de compartilhar a gaveta deve estar desabilitado

  Cenário: Importar uma gaveta recebida de um amigo
    Dado que recebi o arquivo de gaveta "Amigos.stickervault" da gaveta "Amigos"
    Quando eu importo o arquivo "Amigos.stickervault"
    Então devo ver a gaveta "Amigos" aberta
    E devo ver o autor "por Turma"
    E devo ver o contador "3/30 figurinhas"
    Quando eu abro a figurinha 1 da gaveta
    Então devo ver os emojis escolhidos "😂 🔥"

  Cenário: Recusar um arquivo que não é uma gaveta
    Dado que recebi o arquivo inválido "foto.stickervault"
    Quando eu importo o arquivo "foto.stickervault"
    Então devo ver o alerta "Arquivo inválido"
