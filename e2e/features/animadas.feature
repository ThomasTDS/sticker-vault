# language: pt
Funcionalidade: Gavetas animadas
  Como usuário do Sticker Vault
  Quero transformar vídeos curtos e GIFs em figurinhas animadas
  Para mandar figurinhas que se mexem no WhatsApp

  Contexto:
    Dado que o app foi aberto

  Cenário: Criar uma gaveta animada
    Quando eu crio a gaveta animada "Dancinhas" com o autor "Thomas"
    Então devo ver a gaveta "Dancinhas" aberta
    E devo ver a indicação "Gaveta animada"
    E não devo ver o botão de criar figurinha

  Cenário: Transformar vídeos da galeria em figurinhas animadas
    Dado que existe a gaveta animada "Dancinhas" com o autor "Thomas"
    Quando eu adiciono 3 vídeos da galeria
    Então devo ver 3 figurinhas na gaveta
    E devo ver o contador "3/30 figurinhas"
    E o botão de mandar pro WhatsApp deve estar habilitado

  Cenário: Transformar GIFs da galeria em figurinhas animadas
    Dado que existe a gaveta animada "Dancinhas" com o autor "Thomas"
    Quando eu adiciono 3 GIFs da galeria
    Então devo ver 3 figurinhas na gaveta
    E devo ver o contador "3/30 figurinhas"

  Cenário: Recusar uma foto parada numa gaveta animada
    Dado que existe a gaveta animada "Dancinhas" com o autor "Thomas"
    Quando eu escolho uma foto parada da galeria
    Então devo ver o alerta "Foto parada"

  Cenário: Compartilhar uma gaveta animada e recebê-la de volta sem perder a animação
    Dado que existe a gaveta animada "Dancinhas" com o autor "Thomas"
    E que eu adicionei 3 vídeos da galeria
    Quando eu compartilho a gaveta
    E escolho o Sticker Vault no menu de compartilhamento
    Então devo ver a gaveta "Dancinhas" aberta
    E devo ver a indicação "Gaveta animada"
    E devo ver o contador "3/30 figurinhas"
