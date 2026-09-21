# Guia rápido do proprietário

**Catálogo:** https://reidogadocarnes.com.br/

**Painel:** https://reidogadocarnes.com.br/?view=admin. Escolha a unidade e informe a senha do arquivo privado entregue separadamente.

## Antes de divulgar

1. Confira os preços de cada unidade. A base inicial veio do Goomer da Coronel e foi copiada para Bingen e Corrêas.
2. Em **Produtos**, revise os cinco itens pausados com indicação **Revisar**. Confira se são vendidos por kg, pacote/unidade ou peça e ajuste o peso médio. Marque **Disponível para pedidos** para publicá-los.
3. Confira a descrição e o endereço de Bingen e Corrêas em `js/config.js`: somente o bairro e a cidade estão preenchidos, porque os endereços completos não foram informados.
4. Faça um pedido pequeno de teste em cada unidade e confirme que o WhatsApp aberto pertence à loja. O site monta a mensagem; o cliente precisa tocar em enviar no WhatsApp.

## Como o cliente compra

O cliente escolhe produtos, subcortes e quantidades sem informar a loja. Preenche seus dados e toca em **Enviar pedido**. Só então aparecem os botões **Unidade Coronel**, **Unidade Bingen** e **Unidade Corrêas**, cada um com seu total. Ao tocar na unidade, o pedido é registrado e o WhatsApp correspondente é aberto.

## Rotina

- **Alterar preço ou foto:** Painel → Produtos → Editar → salvar.
- **Editar subcortes:** no produto, use os campos de nome e preço em **Subcortes, sabores e preços**.
- **Excluir um produto:** use **Excluir** na lista ou **Excluir produto** dentro da edição e confirme. O histórico permanece.
- **Tirar um item de venda:** desmarque Disponível para pedidos.
- **Organizar o balcão:** Painel → Categorias → nome e posição no catálogo.
- **Atender pedido:** Painel → Pedidos → Ver pedido → conferir sacola e peso → atualizar status.
- **Ver compras de um cliente:** Painel → Clientes → Ver compras.

Os valores apresentados são estimativas. Confirme o preço final, frete e pagamento com o cliente. O painel não considera um pedido “pago” só porque ele foi registrado ou finalizado.

O catálogo usa o projeto Firebase que você forneceu, ID `gen-lang-client-0241129459`, e o banco Firestore **catalogo**. No Console Firebase, selecione esse banco para visualizar os produtos e pedidos. A região **São Paulo** é somente a localização dos servidores do Google; não é uma unidade da loja. O projeto do caixa não foi alterado.

Guarde as senhas fora do GitHub e compartilhe cada senha somente com a equipe da unidade correspondente. Para mudar uma senha, use o botão **Alterar senha** no painel. Se perder o acesso, o proprietário do Firebase pode redefinir a conta com o procedimento administrativo descrito no README.
