# language: pt
Funcionalidade: Responder figurinha
  Como usuário do Sticker Vault
  Quero que o app sugira uma figurinha minha para responder a que recebi no WhatsApp
  Para ter sempre a figurinha certa na hora certa

  Contexto:
    Dado que o app foi aberto
    E que existe a gaveta "Reações" com o autor "Thomas"
    E que eu adicionei 3 imagens da galeria
    E que a figurinha 1 da gaveta tem os emojis "🤣"
    E que a figurinha 2 da gaveta tem os emojis "😂"
    E que a figurinha 3 da gaveta tem os emojis "😭"
    E volto para a tela inicial

  Cenário: Pedir acesso às figurinhas recebidas uma única vez
    Dado que recebi no WhatsApp a figurinha "recebida-risada.webp"
    Quando eu abro a tela de responder figurinha
    Então devo ver o pedido de acesso às figurinhas recebidas
    Quando eu dou acesso à pasta de figurinhas do WhatsApp
    Então devo ver a lista de figurinhas recebidas
    Quando eu volto e abro de novo a tela de responder figurinha
    Então devo ver a lista de figurinhas recebidas

  Cenário: Sugerir respostas pelos emojis da figurinha recebida
    Dado que recebi no WhatsApp a figurinha "recebida-risada.webp"
    E que dei acesso às figurinhas recebidas
    Quando eu escolho a figurinha recebida mais recente
    Então devo ver que a figurinha recebida diz "😂"
    E devo ver 2 sugestões de resposta
    E a sugestão 1 deve ser a figurinha "😂"
    E a sugestão 2 deve ser a figurinha "🤣"

  # O emulador não tem o WhatsApp: o envio como figurinha (gaveta adicionada e busca pelo emoji) é validado
  # manualmente em um aparelho real.
  Cenário: Mostrar onde está a figurinha sugerida e mandar como imagem
    Dado que recebi no WhatsApp a figurinha "recebida-risada.webp"
    E que dei acesso às figurinhas recebidas
    Quando eu escolho a figurinha recebida mais recente
    E eu toco na sugestão 1
    Então devo ver que a figurinha sugerida está na gaveta "Reações"
    E devo ver o aviso de que o WhatsApp não está instalado
    Quando eu mando a sugestão como imagem
    Então o menu de compartilhamento deve abrir

  Cenário: Escolher o emoji de uma figurinha recebida sem emojis
    Dado que recebi no WhatsApp a figurinha "recebida-sem-emoji.webp"
    E que dei acesso às figurinhas recebidas
    Quando eu escolho a figurinha recebida mais recente
    Então devo ver o aviso de figurinha sem emojis
    Quando eu digo que ela quer dizer "😭"
    Então devo ver 1 sugestão de resposta
    E a sugestão 1 deve ser a figurinha "😭"

  Cenário: Avisar quando nenhuma figurinha combina com a resposta
    Dado que recebi no WhatsApp a figurinha "recebida-risada.webp"
    E que dei acesso às figurinhas recebidas
    Quando eu escolho a figurinha recebida mais recente
    E eu digo que ela quer dizer "☕"
    Então devo ver o aviso de que nenhuma figurinha combina
