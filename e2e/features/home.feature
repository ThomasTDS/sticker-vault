# language: pt
Funcionalidade: Tela inicial
  Como usuário do Sticker Vault
  Quero ver a tela inicial ao abrir o app
  Para saber onde ficam guardadas as minhas figurinhas

  Cenário: Exibir a tela inicial vazia na primeira abertura
    Dado que o app foi aberto
    Então devo ver o título "Sticker Vault"
    E devo ver o subtítulo "Suas figurinhas guardadas e prontas para o WhatsApp."
    E devo ver a mensagem de lista vazia "Nenhum pacote por aqui ainda."
