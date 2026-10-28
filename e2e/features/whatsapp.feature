# language: pt
Funcionalidade: Envio de gavetas para o WhatsApp
  Como usuário do Sticker Vault
  Quero mandar minhas gavetas para o WhatsApp
  Para usar as figurinhas nas conversas

  # Os cenários abaixo rodam em um emulador sem o WhatsApp instalado.
  # O fluxo de confirmação dentro do WhatsApp é validado manualmente em um aparelho real.

  Contexto:
    Dado que o app foi aberto
    E que existe a gaveta "Reações" com o autor "Thomas"

  Cenário: Bloquear o envio enquanto a gaveta não tem o mínimo de figurinhas
    Quando eu adiciono 2 imagens da galeria
    Então o botão de mandar pro WhatsApp deve estar desabilitado

  Cenário: Liberar o envio ao atingir o mínimo de figurinhas
    Quando eu adiciono 3 imagens da galeria
    Então o botão de mandar pro WhatsApp deve estar habilitado

  Cenário: Avisar quando o WhatsApp não está instalado
    Dado que eu adicionei 3 imagens da galeria
    Quando eu mando a gaveta pro WhatsApp
    Então devo ver o alerta "Cadê o WhatsApp?"
