# Guia rápido do proprietário

**Catálogo:** https://reidogadocarnes.com.br/

**Painel:** https://reidogadocarnes.com.br/?view=admin. Informe a senha única do arquivo privado entregue separadamente.

## Antes de divulgar

1. Confira os preços no cadastro único. Qualquer alteração vale para Coronel, Bingen e Corrêas.
2. Em **Produtos**, revise os cinco itens pausados com indicação **Revisar**. Confira se são vendidos por kg, pacote/unidade ou peça e ajuste o peso médio. Marque **Disponível para pedidos** para publicá-los.
3. Confira a descrição e o endereço de Bingen e Corrêas em `js/config.js`: somente o bairro e a cidade estão preenchidos, porque os endereços completos não foram informados.
4. Faça um pedido pequeno de teste em cada unidade e confirme que o WhatsApp aberto pertence à loja. O site monta a mensagem; o cliente precisa tocar em enviar no WhatsApp.

## Como o cliente compra

O cliente escolhe produtos, subcortes e quantidades sem informar a loja. Preenche seus dados e toca em **Enviar pedido**. Só então aparecem os botões **Unidade Coronel**, **Unidade Bingen** e **Unidade Corrêas**, todos com o mesmo total estimado. Ao tocar na unidade, o pedido é registrado e o WhatsApp correspondente é aberto.

## Rotina

- **Ver tudo:** Pedidos e Clientes iniciam com **Todas as unidades**. Use o filtro para Coronel, Bingen ou Corrêas.
- **Alterar preço ou foto:** Painel → Produtos → Editar → salvar.
- **Editar subcortes:** no produto, use os campos de nome e preço em **Subcortes, sabores e preços**.
- **Excluir um produto:** use **Excluir** na lista ou **Excluir produto** dentro da edição e confirme. O histórico permanece.
- **Tirar um item de venda:** desmarque Disponível para pedidos.
- **Organizar o balcão:** Painel → Categorias → nome e posição no catálogo.
- **Atender pedido:** Painel → Pedidos → dois cliques na linha ou toque no ícone de abrir → conferir sacola e peso → preencher **Valor final do pedido (R$)**. Salve o valor ou toque no ícone de confirmação para salvar e finalizar. O relógio mantém ou devolve o pedido a Pendente.
- **Ver compras de um cliente:** Painel → Clientes → Ver compras.

Os valores da vitrine e da sacola são estimativas. O histórico usa o valor final registrado pelo administrador. Confirme o preço final, frete e pagamento com o cliente. O painel não considera um pedido “pago” só porque ele foi registrado ou finalizado.

O catálogo usa o projeto Firebase que você forneceu, ID `gen-lang-client-0241129459`, e o banco Firestore **catalogo**. No Console Firebase, selecione esse banco para visualizar os produtos e pedidos. A região **São Paulo** é somente a localização dos servidores do Google; não é uma unidade da loja. O projeto do caixa não foi alterado.

Guarde a senha única fora do GitHub. Ela permite administrar as três unidades; compartilhe somente com quem deve ter esse acesso. Os antigos logins por unidade foram desativados. Para mudar uma senha, use o botão **Alterar senha** no painel. Se perder o acesso, o proprietário do Firebase pode redefinir a conta com o procedimento administrativo descrito no README.

O **Total confirmado** e o histórico de clientes somam os valores finais registrados. Pedidos ainda sem valor final aparecem como estimativa e não entram nessa soma. Inclua frete e descontos no valor final combinado. A estimativa original fica preservada.
