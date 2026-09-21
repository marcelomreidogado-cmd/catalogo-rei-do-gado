# Rei do Gado — catálogo e painel das unidades

Catálogo móvel em HTML, CSS e JavaScript puro. Hospedagem estática no GitHub Pages; Firebase Authentication e Firestore para o funcionamento real. Nenhum servidor Node é necessário para usar o site.

## Abrir

- Catálogo publicado: https://reidogadocarnes.com.br/
- Administração: https://reidogadocarnes.com.br/?view=admin
- Arquivos locais: `index.html` e `index.html?view=admin`.
- A loja é escolhida exclusivamente no último passo do pedido, nos botões Coronel, Bingen e Corrêas.

Use um servidor HTTP para rodar localmente: `python3 -m http.server 4173`. Abra `http://localhost:4173`. Abrir o HTML diretamente como `file://` não permite carregar os módulos e o catálogo.

## O que está incluído

- Três unidades, cada uma com seu catálogo, login, pedidos e clientes.
- Cadastro, edição e exclusão de produtos e categorias; pausa de produtos e upload de fotos.
- Variações de corte com preços diferentes; venda em kg, por unidade ou peça com peso médio.
- Vitrine e sacola únicas, com os produtos ativos das três unidades, preservadas neste navegador. Na sacola, os botões ajustam 250 g por toque; o campo de quantidade aceita precisão de 1 g, a partir de 250 g. Até 10 opções diferentes por pedido, limite consistente com as regras de validação do Firestore.
- Checkout com nome, telefone, retirada/entrega, endereço, forma de pagamento, troco e observações. Ao clicar em **Enviar pedido**, aparecem os três botões de unidade, com o total correspondente. Cada total é recalculado com os preços daquela loja; unidades sem algum item ou subcorte ficam indisponíveis para aquela sacola.
- Pedido gravado antes de abrir o WhatsApp. Se a gravação falhar, a sacola permanece. Repetir a tentativa usa o mesmo identificador para evitar duplicação.
- Link de WhatsApp disponível na confirmação caso o navegador bloqueie a nova aba. A mensagem precisa ser enviada pelo cliente no WhatsApp.
- Pedidos em tempo real, mudança de status e histórico agrupado por telefone normalizado: número de pedidos, soma dos valores estimados, último pedido e todas as sacolas.

## Configuração central

Tudo começa em `js/config.js`. As credenciais do aplicativo Web Firebase são públicas por definição; elas identificam o projeto. A autorização está nas regras, nos usuários de Authentication e nos documentos `admins/{uid}`. Nunca coloque chaves de conta de serviço ou senhas reais nesse arquivo.

O catálogo está conectado ao projeto fornecido pelo proprietário: `gen-lang-client-0241129459`. O banco `catalogo` usa Firestore Enterprise Native em `southamerica-east1` (São Paulo), com cota gratuita e atualizações em tempo real. São Paulo indica a localização dos servidores do Google; as unidades continuam sendo Coronel, Bingen e Corrêas, em Petrópolis. Esta configuração não vinculou conta de faturamento nem ativou Storage.

Em 18/09/2026, o catálogo e os três acessos administrativos foram copiados do projeto inicial para este projeto, preservando as senhas. O projeto inicial foi mantido; o sistema de caixa e o Realtime Database já existente no projeto fornecido não foram alterados. O site utiliza exclusivamente o banco Firestore chamado `catalogo`.

WhatsApps configurados:

| Unidade | Número internacional |
| ------- | -------------------- |
| Coronel | 5524992177114        |
| Bingen  | 552420171476         |
| Corrêas | 5524981754161        |

Os acessos iniciais ficam em arquivo privado entregue separadamente, fora deste repositório. Cada conta só tem permissão para uma unidade. As contas usam identificadores de login internos, não caixas de e-mail para contato.

## Operação da loja

1. Abra a área administrativa, escolha a unidade e entre com a senha correspondente.
2. Em **Produtos**, edite nomes, preços, fotos, categorias e disponibilidade. Em **Subcortes, sabores e preços**, edite o nome e o preço de cada opção. Use **Adicionar variação** para criar outra opção. Os identificadores das opções existentes são preservados ao editar.
3. Para peça, informe o preço por kg e o peso médio em kg. O site calcula a estimativa por peça; o peso real é confirmado pela loja.
4. Em **Pedidos**, abra a sacola e mude o status: Pendente → Em preparação → Saiu para entrega → Finalizado. Uma retirada pode passar diretamente para Finalizado.
5. Em **Clientes**, consulte compras anteriores, valores estimados e o último pedido.
6. O botão **Excluir** aparece ao lado do produto e dentro da edição. A confirmação informa o nome do item; o histórico dos pedidos permanece. Para excluir uma categoria, mova ou exclua seus produtos primeiro. Excluir um produto preserva os registros dos pedidos antigos (nome, preço e quantidade naquele momento).

O botão **Importar catálogo Goomer** adiciona somente os registros ausentes. Ele não atualiza nem sobrescreve os produtos existentes. Não existe sincronização contínua com o Goomer.

## Origem e revisão dos produtos

Importação inicial do [cardápio Goomer fornecido](https://cardapio-rei-do-gado.goomer.app), consultado em 17/09/2026: 99 produtos, 17 categorias e 89 fotos. Opções e preços são preservados. Os 10 produtos sem foto usam uma indicação visual de ausência de foto.

A revisão editorial de setembro de 2026 reuniu quatro cadastros repetidos: Bombom da alcatra, Peito de frango extra limpo, Maionese do Rei e Molhos da casa. A base revisada tem **95 produtos únicos, 90 ativos e 5 pausados**, distribuídos em 17 categorias. Foram corrigidos nomes, acentos, descrições, marcas, unidades escritas e opções. A maionese com bacon ficou em R$ 29,90, conforme confirmação do proprietário. O bombom preserva o preço da peça inteira e os preços dos cortes preparados.

Cinco produtos com unidade, peso ou preço ambíguo permanecem pausados. Veja `data/import-review.json` e revise no painel antes de ativá-los. Os demais preços também devem ser conferidos pelo responsável antes de divulgar o catálogo. A mesma base inicial foi copiada para as três unidades; alterações posteriores são independentes.

A logo PNG original, sem redesenho ou distorção, e as fontes foram recuperadas do arquivo **Rei do Gado - Marca.rar** do proprietário. São usados **Corona**, **Clarendon BT** (Roman, Bold e Black) e **Dallas Print Shop Sans**, convertidos para WOFF2 e hospedados junto ao site. Não há fontes genéricas carregadas por CDN. A paleta segue os valores RGB do manual: vinho `#5A0B14`, preto `#000000`, branco `#FFFFFF` e amarelo `#FFD583`; o vermelho secundário é `#AE0114`.

O arquivo Corona original mapeia letras acentuadas para letras sem acento. Por isso a fonte é reservada a chamadas fixas sem acentos; nomes e títulos dinâmicos usam Clarendon original, preservando a grafia correta. Veja `IDENTIDADE-E-REVISAO.md`. As fotos são do catálogo fornecido pelo proprietário.

## Fotos e plano gratuito

Padrão: `imageMode: 'firestore'`. A imagem é convertida para JPEG e comprimida no navegador, com lado máximo de 900 px e Base64 de até 180.000 caracteres. O campo não é indexado. Arquivos de entrada: JPEG, PNG ou WebP até 12 MB. Imagens muito detalhadas que não caibam são rejeitadas com uma explicação.

O [Cloud Storage para Firebase exige o plano Blaze](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024). Não foi ativado. Para usá-lo voluntariamente: configure seu bucket, publique `storage.rules` e mude `imageMode` para `storage`. As regras do Storage usam os atributos de autenticação `storeAdmin: true` e `branchId`, atribuídos pelo responsável com Admin SDK; usuários não podem atribuí-los a si mesmos.

A cota gratuita do Firestore é finita. Se for excedida, novas operações podem ser interrompidas no plano gratuito. Fotos em Base64 aumentam o volume lido; para um catálogo maior, prefira fotos estáticas em `assets/products` ou avalie Storage conscientemente. [Cotas oficiais](https://firebase.google.com/docs/firestore/enterprise/quotas-native-mode).

## Modelo e segurança

```
admins/{uid}                              { branchId, enabled }
branches/{branchId}/categories/{id}       { name, sort }
branches/{branchId}/products/{id}         nome, categoria, preços, opções, foto, ativo...
branches/{branchId}/orders/{id}           cliente, sacola, total estimado, status, datas
```

Categorias e produtos ativos são públicos. Pedidos não são públicos: clientes anônimos só acessam o recibo de seu próprio pedido e não podem listar históricos. Administradores só leem pedidos e alteram catálogo/status da sua unidade. Os perfis de acesso só podem ser criados pelo Console ou Admin SDK; não há cadastro de administradores na interface. O aplicativo usa sessões Firebase separadas para cliente e administrador, e encerra a assinatura de pedidos ao sair.

**Regras protótipo:** as regras entregues restringem dados pessoais à unidade responsável, impedem elevação de privilégios e tornam o conteúdo recebido do pedido imutável. Foram verificadas no emulador, incluindo isolamento entre unidades. Revise e valide as regras antes de divulgação ampla e sempre que ampliar o modelo de dados.

**Limite do modelo estático:** nome, preço, quantidade e total de um pedido são uma solicitação enviada pelo navegador do cliente. A interface consulta os preços novamente no checkout, as regras validam o envelope e a soma dos valores, mas não certificam cada preço contra o catálogo. Um cliente que ignore a interface pode enviar valores falsos. Por isso todos os valores são estimativas e a equipe precisa conferir os itens e a pesagem antes de confirmar. Não há cobrança online. Para aceitar pagamento automático, adicione um backend que recalcule preços e disponibilidade antes de cobrar. Authentication anônimo não elimina spam; acompanhe as cotas e avalie App Check antes de campanhas de grande alcance.

O agrupamento de clientes usa o telefone informado; o site não verifica a posse desse telefone por SMS. A soma no painel representa pedidos, não receita recebida. Clientes não têm um portal público para consultar outros pedidos.

## Reutilizar em outro Firebase

1. Crie seu projeto, sem alterar o sistema de caixa. Para manter esta configuração, crie um banco Enterprise Native chamado `catalogo` em sua região, com acesso Firestore e realtime habilitados. Se usar Standard, use `databaseId: '(default)'` e ajuste `firebase.json`.
2. Ative Authentication por E-mail/Senha e Anônimo.
3. Registre um aplicativo Web e cole o objeto público em `js/config.js`. Ajuste `databaseId`, `demo: false`, unidades e WhatsApps.
4. Adicione o domínio do GitHub Pages e `localhost` aos domínios autorizados.
5. Crie três contas de administração. No Firestore, crie `admins/UID_DA_CONTA` com `branchId: 'coronel'` (ou `bingen`/`correas`) e `enabled: true`.
6. Publique somente as regras e índices: `npx -y firebase-tools@latest deploy --only firestore,auth --project SEU_PROJECT_ID`. Para habilitar Storage, faça isso separadamente após configurar conscientemente o plano e o bucket.
7. Entre em cada unidade e clique em **Importar catálogo Goomer** para carregar a base inicial.

Demonstração completamente local: apague os campos de `firebase` e use `demo: true`. As senhas simples de demonstração ficam em `config.js`. Esse modo é identificado na interface, não envia mensagens, e guarda seus registros somente no navegador. Nunca use senhas embutidas no JavaScript para proteger dados reais. O aplicativo não muda automaticamente para demonstração quando o Firebase falha.

## GitHub Pages

Publique esta pasta como raiz do repositório, com `index.html`, `.nojekyll`, `styles.css`, `js`, `assets` e `data`. Em **Settings → Pages**, selecione **Deploy from a branch → main → /(root)**. URLs relativas permitem hospedar em `https://USUARIO.github.io/REPOSITORIO/`.

Não publique arquivos de acessos, contas de serviço, logs, pastas de trabalho ou backups contendo pedidos. A configuração do app Web Firebase pode ser pública.

## Verificação

`npm test` verifica cálculos em centavos, arredondamento, peças, kg fracionados, mensagens, agrupamento, vitrine unificada, diferenças de preço entre unidades e indisponibilidade de subcortes. Também confere os 95 produtos, duplicações, descrições, categorias, fotos e preços de todas as variações.

Para regressão da interface: `npm install`, `npx playwright install chromium`, inicie o site com `npm start` e, em outro terminal, rode `npm run test:ui`. O teste usa demonstração isolada por interceptação da configuração e não grava no Firebase nem abre WhatsApp. Cobre os três destinos, retorno no checkout, carrinho persistido, upload, variações, edição/exclusão e categorias. Capturas ficam em `.qa/`. Defina `RDG_BROWSER_CHANNEL=chrome` para usar Chrome instalado.

`tests/firestore.rules.test.mjs` verifica leituras públicas/privadas, isolamento de unidades, alterações de status, bloqueio de elevação de privilégios, total e limite da sacola. Requer Node, Java 21+, `npm install`, e emuladores. Rode `npm run test:rules`. Nenhum teste envia WhatsApp.

Fluxos móveis foram verificados também em navegador: seleção da unidade, carrinho, checkout, upload de imagem, CRUD, status e histórico. O catálogo usa consultas de coleção tradicionais porque o painel precisa de atualizações em tempo real.

## Recuperação administrativa de senha

Para mudar sua própria senha, use **Alterar senha** no painel. Os identificadores `@reidogadocatalogo.invalid` são logins internos e não recebem e-mails. Se esquecer a senha, o proprietário do projeto pode autenticar o ambiente com Application Default Credentials (por exemplo, `gcloud auth application-default login`), instalar as dependências, definir `RDG_NEW_PASSWORD` sem salvar em arquivos públicos e executar `node scripts/reset-password.mjs IDENTIFICADOR_DA_UNIDADE`. A ferramenta recusa contas sem a função de administrador e revoga as sessões anteriores. Esse utilitário nunca é executado no navegador.

## Quantidades no catálogo e no WhatsApp

Pesos usam três casas decimais: **0,500 kg (500 g)** e **1,300 kg**. A escolha do produto aceita incrementos de 1 g, a partir de 250 g; os botões da sacola continuam ajustando 250 g. Peças usam contagem inteira e mostram o peso total estimado em uma linha separada. Na mensagem do WhatsApp, os produtos começam com **Item -**, sem numeração, e a quantidade fica em negrito. Os testes cobrem essa formatação, os totais e a leitura em telas de 320 a 1440 px.
