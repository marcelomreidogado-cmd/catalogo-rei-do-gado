# Catálogo Rei do Gado — guia do projeto

Catálogo móvel de pedidos do açougue Rei do Gado (lojas Coronel, Bingen e Corrêas, Petrópolis) + painel administrativo único (`?view=admin`). Documentação completa no `README.md`; marca e revisão de produtos em `IDENTIDADE-E-REVISAO.md`.

## Publicação
- GitHub Pages da `main`, domínio próprio https://reidogadocarnes.com.br/ (`CNAME`, `DOMINIO.md`). Admin: `/?view=admin`.

## Arquitetura
- HTML/CSS/JS puro com ES modules, sem build: `index.html`, `styles.css`, `js/config.js` (configuração central, credenciais Web públicas), `js/core.js` (regras puras, testáveis), `js/data.js` (Firebase), `js/app.js` (interface).
- Precisa de servidor HTTP local: `npm start` → http://localhost:4173 (`file://` não carrega os módulos).
- Firebase projeto `gen-lang-client-0241129459`, banco Firestore **nomeado `catalogo`** (Enterprise Native, `southamerica-east1`). Plano gratuito: Storage não está ativado; fotos vão em Base64 no Firestore (`imageMode: 'firestore'`, JPEG até 900 px / 180 mil caracteres).
- Modelo: `admins/{uid}`, `catalog/main/categories/{id}`, `catalog/main/products/{id}`, `branches/{branchId}/orders/{id}`. Catálogo e preços são compartilhados pelas três lojas; só pedidos e WhatsApp são por unidade. Limite de 10 itens por pedido (casado com `firestore.rules`).
- `data/catalog.json` é só a importação inicial (Goomer); o cadastro real vive no Firestore.

## Identidade visual (não alterar sem pedido)
- Logo original em `assets/logo.png`; fontes originais em WOFF2 em `assets/fonts` (Corona só para chamadas fixas **sem acento**; Clarendon BT para textos dinâmicos; Dallas Print Shop Sans para assinaturas). Sem fontes de CDN.
- Paleta do manual: vinho `#5A0B14`, preto `#000`, branco `#FFF`, amarelo `#FFD583`; vermelho `#AE0114` só para exclusão/aviso.

## Testes
- `npm ci` e depois: `npm test` (unitários), `npm run test:ui` (Playwright: UI, responsivo, admin, observações), `npm run test:rules` (regras no emulador).
- Rodar os testes antes de cada commit; corrigir antes de enviar.

## Regras
- `firestore.rules`, `storage.rules`, login e `admins/*` são sensíveis: perguntar antes de mudar.
- Nunca commitar senhas, chaves de conta de serviço ou dados de clientes. O `adminEmail` em `config.js` é só identificador.
- Textos em português do Brasil; commits em português. Usuário (Marcelo) trabalha no Mac e prefere soluções simples.
