# Identidade e revisão do catálogo

## Aplicação da marca

A fonte de referência é o Mini Manual de Identidade Visual de 30/01/2019, junto com o pacote original **Rei do Gado - Marca.rar** do proprietário. A logo PNG original foi mantida integralmente, em sua proporção, sobre fundo branco.

| Uso | Arquivo original |
| --- | --- |
| Chamadas principais sem acentos | Corona.otf |
| Textos, nomes, preços e formulários | Clarendon BT Roman e Bold — tt0283m.ttf e tt0284m.ttf |
| Destaques de texto | Clarendon BT Black — tt0351m.ttf |
| Assinaturas curtas em caixa alta | DallasPrintShop-Sans.ttf e DallasPrintShop-SansBold.ttf |

As fontes foram convertidas para WOFF2, sem redesenho. Os rótulos do manual diferem dos nomes internos de alguns arquivos; foram usados os arquivos do pacote original, conferidos com as fontes incorporadas ao PDF. O arquivo Corona original não desenha os acentos: nomes como **Corrêas**, **Hambúrgueres** e **Pão de alho** usam Clarendon, que possui esses caracteres.

Cores RGB primárias do manual: vinho **#5A0B14**, preto **#000000**, branco **#FFFFFF** e amarelo **#FFD583**. O vermelho secundário **#AE0114** identifica ações de exclusão e avisos. Tons neutros claros são usados em divisórias e campos para leitura.

## Revisão dos produtos

A base inicial tinha 99 cadastros. A revisão resultou em **95 produtos únicos**, com **90 ativos**, **5 pausados**, **17 categorias** e **17 produtos com opções de corte, preparo, sabor ou tamanho**. São utilizadas 85 fotos de produtos; os dez itens sem foto mantêm a logo original como indicação visual.

Foram revisados todos os nomes, descrições e rótulos de variações: acentuação, maiúsculas/minúsculas, marcas, unidades escritas, abreviações e trechos duplicados. Preços antigos mencionados apenas em descrições foram retirados para evitar contradição com o preço efetivo de cada opção.

| Repetição | Tratamento |
| --- | --- |
| Bombom da alcatra | Um produto: peça inteira a R$ 107,90/kg e cortes preparados a R$ 109,90/kg, preservando os preços das duas entradas originais. |
| Peito de frango extra limpo | Um cadastro na categoria Frango, com peito, filezinho e estrogonofe. Mantido pausado até a confirmação da unidade de cobrança e dos pesos. |
| Maionese do Rei | Um cadastro em Molhos, com defumada e com bacon. R$ 29,90 na opção com bacon, confirmado pelo proprietário. |
| Molhos da casa | Um cadastro em Molhos, preservando mostarda e mel, barbecue e dijonese. |

Subcortes ou sabores claramente presentes na descrição original passaram a ser opções selecionáveis: acém moído/cubos/pedaço, bife/pedaço da alcatra e patinho, sabores de linguiça recheada, pão de alho e geleia. Os preços comuns dessas opções vieram do cadastro de origem; a loja pode editar cada uma separadamente no painel.

O Denver VPJ Black Angus passou a usar a peça de aproximadamente 1 kg informada na descrição original, com cálculo pelo peso.

## Itens que exigem confirmação da loja

Estes itens continuam pausados; a revisão de escrita não resolve a ambiguidade comercial do cadastro de origem:

- Almôndegas temperadas: preço do pacote versus preço por kg.
- Medalhão de sobrecoxa com bacon: valor da bandeja versus valor por kg.
- Peito de frango extra limpo: peso diferente conforme o preparo e unidade de cobrança.
- Costela de cordeiro: confirmar preço por pacote ou por kg.
- Filé-mignon suíno do dia a dia: confirmar preço do pacote ou por kg.

## Funcionamento e verificações

O cliente navega sem escolher loja. No botão **Enviar pedido**, aparecem Coronel, Bingen e Corrêas, com os totais calculados usando os produtos e preços atuais de cada unidade. Unidades sem algum item ou opção da sacola não permitem o envio daquele pedido. A gravação ocorre antes da abertura do WhatsApp.

Foram verificados os três destinos em pedidos de teste no Firebase, sem envio de mensagens. Os pedidos de teste foram removidos. Também foram conferidos preços e subcortes, sacola persistida, retorno aos dados, histórico, mudança de status, isolamento da unidade, criação/edição/exclusão, cancelamento de exclusão, upload de foto e categorias. Os testes reproduzíveis ficam em `tests/`.
