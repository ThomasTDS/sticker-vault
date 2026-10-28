# language: pt
Funcionalidade: Tela inicial
  Como usuário do Sticker Vault
  Quero ver a tela inicial ao abrir o app
  Para saber onde ficam guardadas as minhas figurinhas

  Cenário: Exibir o cofre vazio na primeira abertura
    Dado que o app foi aberto
    Então devo ver o título "Sticker Vault"
    E devo ver o subtítulo "Suas figurinhas guardadas e prontas para o WhatsApp."
    E devo ver a mensagem de cofre vazio "Seu cofre tá vazio."
    E devo ver a dica "Crie uma gaveta e guarde suas primeiras figurinhas."
