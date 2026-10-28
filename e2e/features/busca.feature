# language: pt
Funcionalidade: Emojis, tags e busca de figurinhas
  Como usuário do Sticker Vault
  Quero classificar minhas figurinhas com emojis e tags
  Para encontrá-las rápido no cofre e no WhatsApp

  Contexto:
    Dado que o app foi aberto
    E que existe a gaveta "Reações" com o autor "Thomas"
    E que eu adicionei 3 imagens da galeria

  Cenário: Escolher emojis para uma figurinha
    Quando eu abro a figurinha 1 da gaveta
    E escolho os emojis "😂, 🔥"
    E salvo a figurinha
    E abro a figurinha 1 da gaveta
    Então devo ver os emojis escolhidos "😂 🔥"

  Cenário: Limitar a 3 emojis por figurinha
    Quando eu abro a figurinha 1 da gaveta
    E escolho os emojis "😂, 🔥, 👍, 🎉"
    Então devo ver os emojis escolhidos "😂 🔥 👍"
    E devo ver a dica de emojis "Máximo de 3 emojis por figurinha."

  Cenário: Buscar figurinha por tag ignorando maiúsculas e acentos
    Dado que a figurinha 2 da gaveta tem a tag "Reação do Chefe"
    Quando volto para a tela inicial
    E busco por "reacao do chefe"
    Então devo ver 1 figurinha nos resultados da busca
    E o resultado 1 deve ser da gaveta "Reações"

  Cenário: Buscar figurinha por emoji
    Dado que a figurinha 3 da gaveta tem os emojis "☕"
    Quando volto para a tela inicial
    E busco por "☕"
    Então devo ver 1 figurinha nos resultados da busca

  Cenário: Buscar pelo nome da gaveta
    Quando volto para a tela inicial
    E busco por "reações"
    Então devo ver 3 figurinhas nos resultados da busca

  Cenário: Busca sem resultados
    Quando volto para a tela inicial
    E busco por "não existe"
    Então devo ver a mensagem de busca vazia "Nada no cofre com isso. Tenta outra busca?"
