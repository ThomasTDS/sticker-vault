# language: pt
Funcionalidade: Gavetas de figurinhas
  Como usuário do Sticker Vault
  Quero organizar minhas figurinhas em gavetas
  Para montar pacotes que possam ir para o WhatsApp

  Contexto:
    Dado que o app foi aberto

  Cenário: Criar uma gaveta
    Quando eu crio a gaveta "Reações do grupo" com o autor "Thomas"
    Então devo ver a gaveta "Reações do grupo" aberta
    E devo ver o autor "por Thomas"
    E devo ver o contador "0/30 figurinhas"
    E devo ver o aviso "Faltam 3 figurinhas para mandar a gaveta pro WhatsApp."
    E devo ver a mensagem de gaveta vazia "Gaveta vazia. Bora enchê-la de figurinhas?"

  Cenário: Gaveta criada aparece na tela inicial
    Quando eu crio a gaveta "Memes" com o autor "Thomas"
    E volto para a tela inicial
    Então devo ver a gaveta "Memes" na lista com "0/30 figurinhas"

  Cenário: Não permitir gaveta sem nome e sem autor
    Quando eu tento criar uma gaveta sem preencher os campos
    Então devo ver o erro de nome "Toda gaveta precisa de um nome."
    E devo ver o erro de autor "Conta pra gente quem é o dono dessas figurinhas."

  Cenário: Excluir uma gaveta
    Dado que existe a gaveta "Temporária" com o autor "Thomas"
    Quando eu excluo a gaveta aberta
    Então devo ver a mensagem de cofre vazio "Seu cofre tá vazio."
