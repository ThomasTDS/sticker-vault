# language: pt
Funcionalidade: Figurinhas da galeria
  Como usuário do Sticker Vault
  Quero guardar imagens da galeria nas minhas gavetas
  Para transformá-las em figurinhas

  Contexto:
    Dado que o app foi aberto
    E que existe a gaveta "Reações" com o autor "Thomas"

  Cenário: Adicionar figurinhas da galeria
    Quando eu adiciono 2 imagens da galeria
    Então devo ver 2 figurinhas na gaveta
    E devo ver o contador "2/30 figurinhas"
    E devo ver o aviso "Falta 1 figurinha para mandar a gaveta pro WhatsApp."

  Cenário: Completar o mínimo de figurinhas para o WhatsApp
    Quando eu adiciono 3 imagens da galeria
    Então devo ver 3 figurinhas na gaveta
    E não devo ver o aviso de figurinhas faltando

  Cenário: Remover uma figurinha
    Dado que eu adicionei 1 imagem da galeria
    Quando eu removo a primeira figurinha
    Então devo ver a mensagem de gaveta vazia "Gaveta vazia. Bora enchê-la de figurinhas?"
    E devo ver o contador "0/30 figurinhas"
