# Entrega de outubro de 2026

Catálogo: https://reidogadocarnes.com.br/

Painel: https://reidogadocarnes.com.br/?view=admin

## Alterações

- Observação de preparo por item, editável antes do envio e preservada na sacola, no pedido, no WhatsApp e no histórico.
- O mesmo corte com instruções diferentes permanece separado. Ao igualar as instruções na sacola, as quantidades são reunidas dentro dos limites permitidos.
- Fotos oficiais de Linguiça de pernil Romana VPJ (500 g), Amstel Ultra (275 ml) e Lagunitas DayTime (350 ml), com fontes documentadas.
- Validação dos pedidos ajustada para permitir dez itens com observações sem exceder o limite de processamento das regras do Firebase.
- Catálogo existente preservado. Nenhuma importação de preços, ativação de produtos ou substituição de cadastro foi feita.

## Verificação

- Testes de cálculos, centavos, peso/peças, catálogo inicial, subcortes e mensagens: aprovados.
- Fluxos de compra nas três unidades, persistência da sacola, edição de observações, HTML escapado, fotos, exclusões, categorias e administração: aprovados.
- Layouts de 320 a 1440 px e leitura visual das telas: conferidos.
- Regras no emulador: acesso privado aos pedidos, administrador único, impossibilidade de alterar a sacola original, valores finais, compatibilidade com pedidos antigos e dez itens com observações de 300 caracteres: aprovados.
- Firebase real: pedidos de teste nas três unidades, repetição sem duplicação, observações gravadas e finalização no painel com valor final preservando a estimativa: aprovados. Os três pedidos temporários foram removidos. Nenhuma mensagem foi enviada pelo WhatsApp.

## Dados que dependem da loja

Quatro produtos ativos ainda precisam de fotos correspondentes; três produtos permanecem pausados para confirmação comercial. Nomes e detalhes estão em `AVALIACAO-DO-CATALOGO.md`. Os endereços completos de Bingen e Corrêas também não foram informados.

## Publicação e recuperação

GitHub Pages publica a raiz de `main`; dados e regras usam o banco Firebase `catalogo`. A senha administrativa fica fora do repositório.

Se a compra ou a finalização deixar de funcionar, restaurar a versão anterior do site pelo Git (commit `7fb8eba`) e investigar antes de fazer nova publicação. As regras desta entrega são compatíveis com pedidos antigos; não devem ser revertidas isoladamente enquanto houver clientes usando a nova versão. As fotografias são alterações somente do campo `image`, com cópia anterior privada e condição de versão para não substituir edições concorrentes.
