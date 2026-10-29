# language: pt
Funcionalidade: Receber gavetas pelo menu "Compartilhar"
  Como usuário do Sticker Vault
  Quero receber uma gaveta compartilhada por outro app
  Para guardá-la no meu cofre sem procurar o arquivo

  # O próprio app exporta a gaveta e a compartilha com o Sticker Vault,
  # validando a ida e a volta do arquivo .stickervault.

  Contexto:
    Dado que o app foi aberto
    E que existe a gaveta "Reações" com o autor "Thomas"
    E que eu adicionei 3 imagens da galeria

  Cenário: Receber a gaveta compartilhada e guardá-la como uma nova gaveta
    Quando eu compartilho a gaveta
    E escolho o Sticker Vault no menu de compartilhamento
    Então devo ver a gaveta "Reações" aberta
    E devo ver o contador "3/30 figurinhas"
    Quando volto da gaveta importada para o cofre
    Então devo ver 2 gavetas no cofre
