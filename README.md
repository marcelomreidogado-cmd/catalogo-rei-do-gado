# Rei do Gado — catálogo e painel das unidades

Catálogo móvel em HTML, CSS e JavaScript puro. Hospedagem estática no GitHub Pages; Firebase Authentication e Firestore para o funcionamento real. Nenhum servidor Node é necessário para usar o site.

## Abrir

- Catálogo: `index.html`
- Administração: `index.html?view=admin`
- Unidade direta: `index.html?unit=coronel`, `?unit=bingen` ou `?unit=correas`

Use um servidor HTTP para rodar localmente: `python3 -m http.server 4173`. Abra `http://localhost:4173`. Abrir o HTML diretamente como `file://` não permite carregar os módulos e o catálogo.

## O que está incluído

- Três unidades, cada uma com seu catálogo, login, pedidos e clientes.
- Cadastro, edição e exclusão de produtos e categorias; pausa de produtos e upload de fotos.
- Variações de corte com preços diferentes; venda em kg, por unidade ou peça com peso médio.
- Sacola separada por unidade, preservada neste navegador. Quantidades em kg variam de 250 g em 250 g. Até 10 opções diferentes por pedido, limite consistente com as regras de validação do Firestore.
- Checkout com nome, telefone, retirada/entrega, endereço, forma de pagamento, troco e observações.
- Pedido gravado antes de abrir o WhatsApp. Se a gravação falhar, a sacola permanece. Repetir a tentativa usa o mesmo identificador para evitar duplicação.
- Link de WhatsApp disponível na confirmação caso o navegador bloqueie a nova aba. A mensagem precisa ser enviada pelo cliente no WhatsApp.
- Pedidos em tempo real, mudança de status e histórico agrupado por telefone normalizado: número de pedidos, soma dos valores estimados, último pedido e todas as sacolas.

## Configuração central

Tudo começa em `js/config.js`. As credenciais do aplicativo Web Firebase são públicas por definição; elas identificam o projeto. A autorização está nas regras, nos usuários de Authentication e nos documentos `admins/{uid}`. Nunca coloque chaves de conta de serviço ou senhas reais nesse arquivo.

O projeto criado para este catálogo é `rei-do-gado-catalogo-2026`, independente de qualquer sistema de caixa. O banco `catalogo` usa Firestore Enterprise Native em `southamerica-east1` (São Paulo), com cota gratuita e atualizações em tempo real. Nenhuma conta de faturamento foi vinculada por este projeto.

WhatsApps configurados:

| Unidade | Número internacional |
| ------- | -------------------- |
| Coronel | 5524992177114        |
| Bingen  | 552420171476         |
| Corrêas | 5524981754161        |

Os acessos iniciais ficam em arquivo privado entregue separadamente, fora deste repositório. Cada conta só tem permissão para uma unidade. As contas usam identificadores de login internos, não caixas de e-mail para contato.

## Operação da loja

1. Abra a área administrativa, escolha a unidade e entre com a senha correspondente.
2. Em **Produtos**, edite nomes, preços, fotos, categorias e disponibilidade. Em opções, use uma linha por variação, por exemplo `Bife | 69.90`.
3. Para peça, informe o preço por kg e o peso médio em kg. O site calcula a estimativa por peça; o peso real é confirmado pela loja.
4. Em **Pedidos**, abra a sacola e mude o status: Pendente → Em preparação → Saiu para entrega → Finalizado. Uma retirada pode passar diretamente para Finalizado.
5. Em **Clientes**, consulte compras anteriores, valores estimados e o último pedido.
6. Para excluir uma categoria, mova ou exclua seus produtos primeiro. Excluir um produto preserva as fotos textuais dos pedidos antigos (nome, preço e quantidade naquele momento).

O botão **Importar catálogo Goomer** adiciona somente os registros ausentes. Ele não atualiza nem sobrescreve os produtos existentes. Não existe sincronização contínua com o Goomer.

## Origem e revisão dos produtos

Importação inicial do [cardápio Goomer fornecido](https://cardapio-rei-do-gado.goomer.app), consultado em 17/09/2026: 99 produtos, 17 categorias e 89 fotos. Opções e preços são preservados. Os 10 produtos sem foto usam uma indicação visual de ausência de foto.

Seis produtos com unidade, peso ou preço ambíguo foram importados pausados. Veja `data/import-review.json` e revise no painel antes de ativá-los. Os demais preços também devem ser conferidos pelo responsável antes de divulgar o catálogo. A mesma base inicial foi copiada para as três unidades; alterações posteriores são independentes.

Logo original fornecida pelo proprietário. A cor primária #5A0B14, o preto e o amarelo #FFD583 seguem o manual fornecido. Oswald e DM Sans são alternativas web; não são as fontes proprietárias do manual. As fotos pertencem ao catálogo fornecido pelo proprietário.

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

`tests/core.test.mjs` verifica cálculos em centavos, arredondamento, peças, kg fracionados, mensagens e agrupamento. Rode `node --test tests/core.test.mjs`.

`tests/firestore.rules.test.mjs` verifica leituras públicas/privadas, isolamento de unidades, alterações de status, bloqueio de elevação de privilégios, total e limite da sacola. Requer Node, Java 21+, `npm install`, e emuladores. Rode `npm run test:rules`. Nenhum teste envia WhatsApp.

Fluxos móveis foram verificados também em navegador: seleção da unidade, carrinho, checkout, upload de imagem, CRUD, status e histórico. O catálogo usa consultas de coleção tradicionais porque o painel precisa de atualizações em tempo real.

## Recuperação administrativa de senha

Para mudar sua própria senha, use **Alterar senha** no painel. Os identificadores `@reidogadocatalogo.invalid` são logins internos e não recebem e-mails. Se esquecer a senha, o proprietário do projeto pode autenticar o ambiente com Application Default Credentials (por exemplo, `gcloud auth application-default login`), instalar as dependências, definir `RDG_NEW_PASSWORD` sem salvar em arquivos públicos e executar `node scripts/reset-password.mjs IDENTIFICADOR_DA_UNIDADE`. A ferramenta recusa contas sem a função de administrador e revoga as sessões anteriores. Esse utilitário nunca é executado no navegador.
