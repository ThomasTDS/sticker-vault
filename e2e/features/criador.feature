# language: pt
Funcionalidade: Criador de figurinhas
  Como usuário do Sticker Vault
  Quero criar figurinhas a partir das minhas fotos
  Para ter figurinhas únicas com texto e sem fundo

  Contexto:
    Dado que o app foi aberto
    E que existe a gaveta "Memes" com o autor "Thomas"

  Cenário: Bloquear o salvamento enquanto nenhuma foto foi escolhida
    Quando eu abro o criador de figurinhas
    Então devo ver a mensagem do criador "Escolha uma foto para começar."
    E o botão de salvar a figurinha criada deve estar desabilitado
    E o botão de remover fundo deve estar desabilitado

  Cenário: Criar uma figurinha com texto estilo meme
    Quando eu abro o criador de figurinhas
    E escolho uma foto da galeria para a figurinha
    E escrevo "quando o chefe diz" no texto de cima
    E escrevo "reunião rapidinha" no texto de baixo
    Então a prévia deve mostrar "QUANDO O CHEFE DIZ" em cima e "REUNIÃO RAPIDINHA" embaixo
    Quando salvo a figurinha criada
    Então devo ver 1 figurinha na gaveta
    E devo ver o contador "1/30 figurinhas"

  # Requer o modelo de recorte do ML Kit, baixado pelo Google Play Services
  # apenas em aparelhos com conta Google. Execute com: npm run test:modelo-ml
  @modelo-ml
  Cenário: Remover e restaurar o fundo da foto
    Quando eu abro o criador de figurinhas
    E escolho uma foto da galeria para a figurinha
    E removo o fundo da foto
    Então devo ver o aviso do criador "Fundo removido."
    Quando restauro o fundo da foto
    Então não devo ver o aviso de fundo removido
