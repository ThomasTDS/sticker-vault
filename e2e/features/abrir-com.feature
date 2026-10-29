# language: pt
Funcionalidade: Abrir gavetas pelo "Abrir com" do Android
  Como usuário do Sticker Vault
  Quero tocar no arquivo de gaveta que recebi e abri-lo direto no app
  Para não precisar procurar o arquivo pelo botão de importar

  Contexto:
    Dado que o app foi aberto

  Cenário: Abrir uma gaveta pelo app Arquivos
    Dado que recebi o arquivo de gaveta "Viagem.stickervault" da gaveta "Viagem"
    Quando eu abro o arquivo "Viagem.stickervault" pelo app Arquivos do Android
    Então devo ver a gaveta "Viagem" aberta
    E devo ver o contador "3/30 figurinhas"
    Quando volto da gaveta importada para o cofre
    Então devo ver a gaveta "Viagem" na lista com "3/30 figurinhas"

  Cenário: Avisar quando o arquivo aberto não é uma gaveta
    Dado que recebi o arquivo inválido "documento.stickervault"
    Quando eu abro o arquivo "documento.stickervault" pelo app Arquivos do Android
    Então devo ver a mensagem de importação "Esse arquivo não é uma gaveta do Sticker Vault."
    Quando toco em voltar para o cofre
    Então devo ver a mensagem de cofre vazio "Seu cofre tá vazio."
