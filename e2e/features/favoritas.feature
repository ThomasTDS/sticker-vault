# language: pt
Funcionalidade: Figurinhas favoritas e mais usadas
  Como usuário do Sticker Vault
  Quero ter minhas figurinhas preferidas sempre à mão
  Para mandá-las rápido sem procurar nas gavetas

  Contexto:
    Dado que o app foi aberto
    E que existe a gaveta "Reações" com o autor "Thomas"
    E que eu adicionei 3 imagens da galeria

  Cenário: Favoritar uma figurinha
    Quando eu abro a figurinha 2 da gaveta
    E toco no botão de favorito
    Então devo ver o botão de favorito "★ Favorita"
    Quando volto para a gaveta
    Então a figurinha 2 da gaveta deve estar marcada como favorita
    Quando volto para a tela inicial
    Então devo ver 1 figurinha na seção de favoritas

  Cenário: Desfazer uma favorita
    Dado que a figurinha 1 da gaveta é favorita
    Quando eu abro a figurinha 1 da gaveta
    E toco no botão de favorito
    Então devo ver o botão de favorito "☆ Favoritar"
    Quando volto para a gaveta
    E volto para a tela inicial
    Então não devo ver a seção de favoritas

  Cenário: Compartilhar uma figurinha pelo Android
    Quando eu abro a figurinha 1 da gaveta
    E compartilho a figurinha
    Então o seletor de compartilhamento do Android deve abrir
    Quando fecho o seletor de compartilhamento
    Então devo ver o contador de uso "Compartilhada 1 vez."

  Cenário: Ordenar as mais usadas pela quantidade de compartilhamentos
    Dado que compartilhei a figurinha 3 da gaveta 1 vez
    E que compartilhei a figurinha 2 da gaveta 2 vezes
    Quando volto para a tela inicial
    Então a seção de mais usadas deve mostrar "2×, 1×"
