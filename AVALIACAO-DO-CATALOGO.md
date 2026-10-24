# Avaliação do catálogo Rei do Gado

## Situação atual — 23/10/2026

O catálogo em produção tem **94 produtos cadastrados e 85 ativos**. As alterações feitas pelo proprietário foram preservadas. O cadastro de produtos, categorias, preços e fotos é único para as três lojas; somente os pedidos são separados por unidade.

Implementado e testado nesta entrega: observação individual de preparo, edição da observação na sacola, instruções no WhatsApp, no pedido salvo e no histórico. O mesmo produto e corte com instruções diferentes fica em linhas separadas. A validação também cobre dez itens com observações de 300 caracteres e a finalização pelo administrador. Pedidos antigos sem esse campo continuam válidos.

Fotos oficiais acrescentadas: **Linguiça de pernil Romana VPJ (500 g), Amstel Ultra (275 ml) e Lagunitas DayTime (350 ml)**. As fontes estão registradas em `data/photo-sources.json`. Nenhum preço do fornecedor foi copiado.

Ainda precisam de foto correspondente ao produto vendido: **Picanha Pull Grill, Assado de tiras Angus, Sal de parrilla Cantagallo — 500 g e Palmito pupunha Grill**. Não foi presumida a marca do palmito nem a apresentação da embalagem do sal. A loja pode anexar essas fotos pelo painel.

Somente três produtos seguem com indicação de revisão comercial; permanecem pausados até a confirmação do proprietário:

| Produto | Informação a confirmar |
|---|---|
| Almôndegas temperadas | Cadastro a R$ 30,00 por pacote; texto antigo mencionava R$ 65,90/kg e aproximadamente 400 g. Confirmar preço e unidade. |
| Costela de cordeiro | Confirmar disponibilidade e R$ 129,90/kg. |
| Filé-mignon suíno do dia a dia | Confirmar disponibilidade, R$ 49,90/kg e se o pacote tem aproximadamente 400 g. |

As seis outras pausas atuais foram mantidas conforme o cadastro da loja. A base inicial de demonstração tem contagens diferentes e não foi importada sobre o Firebase.

O total final após pesagem e os dois status por ícones já estão implementados. Peso real por item, kits, promoções e novos filtros não fazem parte desta entrega. Endereços completos de Bingen e Corrêas ainda não foram informados.

## Registro da avaliação anterior

Revisão de 21/09/2026. O catálogo tem uma base adequada para vender carnes: subcortes dentro do produto, peso fracionado, peças com estimativa, mensagem organizada, gravação do pedido e escolha final da unidade. Ele já vai além de uma cópia do Goomer, mas ainda há oportunidades para facilitar a escolha e a preparação do pedido.

## Referências observadas

- **[OnBeef — Açougue do Pai](https://acougue-do-pai.onbeef.app.br/):** inspeção do catálogo e da [página de Acém](https://acougue-do-pai.onbeef.app.br/product/acem), sem enviar pedido. Há navegação por preparo, opções de corte dentro do produto, peso selecionável e instrução individual. A [página oficial da plataforma](https://www.onbeef.app.br/) descreve também ajuste após pesagem; essa parte administrativa não foi testada.
- **[Swift — Bovinos](https://www.swift.com.br/bovinos):** organização por cortes facilita encontrar a carne. A [picanha de peso variável](https://prod.swiftapp.com.br/picanha-importada-swift-premium-kg/p) explicita uma faixa de peso. Para o Rei do Gado, só devemos informar faixas quando a loja confirmar os limites reais.
- **[e-beef — Cortes](https://www.ebeef.com.br/cortes):** separa espécie e corte, com filtros de marca e peso. Esses filtros ajudam quem procura uma linha específica, mas não é necessário reproduzir toda a complexidade no celular.

## Comparação e prioridades

| Aspecto | Situação do Rei do Gado | Avaliação |
|---|---|---|
| Peso e preço | Três casas decimais, preço por kg e total estimado; peças em contagem inteira | Adequado. Nesta revisão, o tipo de venda e o peso médio da peça também ficaram visíveis na vitrine. |
| Subcortes | Opções e preços dentro do produto; busca encontra nomes de variações | Adequado. Conferir se todas as opções representam o que a loja realmente prepara. |
| Descoberta | Categorias, busca e seções de uso como dia a dia e churrasco | Próxima melhoria: atalhos por preparo, sem criar produtos duplicados. |
| Instruções | Observação geral no checkout | Prioridade: instruções por item, como separar em pacotes ou espessura dos bifes. Cada instrução deve acompanhar a linha no banco e no WhatsApp. |
| Peso após separação | Valor estimado; ajuste final combinado com a loja | Prioridade operacional: registrar peso e total confirmados separadamente do pedido original, preservando o histórico. Não há pagamento online. |
| Fotos | 85 dos 95 cadastros têm foto; nove produtos ativos usam a logo como alternativa | Substituir as ausências por fotos corretas da loja ou do fornecedor autorizado. Fotos de concorrentes não foram copiadas. |
| Cadastro importado | 95 produtos únicos; 90 ativos e cinco pausados para revisão | Os cinco pausados precisam de confirmação comercial de preço, unidade e peso antes da ativação. |
| Gestão | Um login, pedidos/clientes consolidados e filtro por unidade | Adequado para a administração das três lojas. Produtos e categorias continuam editáveis por unidade. |

## Pendências concretas do cadastro

Produtos ativos sem foto própria na base conferida: Assado de tiras Angus; Picanha Pull Grill; Linguiça de pernil Romana VPJ; Sal de parrilla Cantagallo — 500 g; Palmito pupunha Grill; Amstel Ultra — 275 ml; Lagunitas DayTime — 350 ml; Quilmes — 340 ml; Blue Moon.

Continuam pausados para confirmação: Almôndegas temperadas; Medalhão de sobrecoxa com bacon; Peito de frango extra limpo; Costela de cordeiro; Filé-mignon suíno do dia a dia. O painel mostra o nome atual de cada cadastro.

As quantidades acima foram conferidas na base das três unidades. Preços, disponibilidade, origem, conservação, rendimento e faixas de peso não devem ser inferidos a partir de concorrentes. Nenhum preço nem produto existente foi alterado nesta mudança de acesso.

## Ordem sugerida para evolução

1. Completar fotos e revisar os cinco itens pausados.
2. Acrescentar instruções por item e atalhos de preparo.
3. Registrar a pesagem final e o total confirmado no painel, sem apagar a estimativa original.
4. Cadastrar kits, ofertas reais, horários e informações completas de entrega de cada loja.

As sugestões desta seção são próximas etapas, não funcionalidades já implantadas. Não é necessário trocar de plataforma para organizar essas melhorias.

## Atualização em 22/09/2026

O catálogo passou a ser único: preços, fotos, produtos e categorias valem para todas as lojas. A separação por unidade permanece apenas nos pedidos. O painel agora registra o valor final após a pesagem, sem apagar a estimativa original, e usa esse valor nos totais confirmados do histórico. Há apenas Pendente e Finalizado, por ícones; o pedido abre com duplo clique ou pelo botão de abrir. A recomendação anterior sobre registro do **total final** foi implementada; não há registro de peso real individual de cada item nesta etapa. Fotos faltantes e instruções por item continuam pendentes.
