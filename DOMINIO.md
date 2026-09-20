# Domínio do catálogo

Endereço escolhido: **reidogadocarnes.com.br** (também com `www`).

## Situação em 20/09/2026

- Registro.br: domínio publicado, validade até 20/09/2030.
- Firebase: os dois endereços foram adicionados aos domínios autorizados e conferidos no servidor. Os acessos anteriores foram preservados.
- Registro.br: modo avançado ativado. A edição da zona está bloqueada pela mensagem “Domínio em transição. Por favor, aguarde alguns minutos e tente novamente”. O painel também indicou aproximadamente duas horas para liberação de delegação de DNS externo; esse prazo não garante a liberação da zona nem do HTTPS.
- GitHub Pages: endereço atual mantido, sem redirecionamento para o novo domínio enquanto o DNS não puder ser configurado.
- Ainda não divulgar o novo endereço como catálogo ativo.

## Concluir a conexão

1. No Registro.br, abrir o domínio e **Configurar zona DNS**. Confirmar que a edição foi liberada e conferir quaisquer registros existentes antes de adicionar entradas.
2. Com o editor disponível, configurar `reidogadocarnes.com.br` como domínio personalizado do repositório `marcelomreidogado-cmd/catalogo-rei-do-gado` no GitHub Pages, antes de salvar os apontamentos no Registro.br. Sincronizar o arquivo `CNAME` criado na raiz do repositório.
3. No Registro.br, adicionar os registros abaixo. Para a raiz, deixar o campo nome vazio: o Registro.br não aceita `@`.

| Tipo | Nome no Registro.br | Destino |
|---|---|---|
| A | vazio (raiz) | 185.199.108.153 |
| A | vazio (raiz) | 185.199.109.153 |
| A | vazio (raiz) | 185.199.110.153 |
| A | vazio (raiz) | 185.199.111.153 |
| CNAME | www | marcelomreidogado-cmd.github.io |

4. Aguardar a publicação dos registros e a emissão do certificado do GitHub Pages. Habilitar **Enforce HTTPS** quando disponível.
5. Testar catálogo, fotos, fontes, carrinho, checkout, entrada no painel e redirecionamentos (endereço antigo e `www`) no novo domínio. Não enviar mensagens reais às unidades durante testes.
6. Atualizar os links deste guia e do README, e gerar novamente o ZIP de entrega.

Links finais, depois da conexão:

- Catálogo: https://reidogadocarnes.com.br/
- Administração: https://reidogadocarnes.com.br/?view=admin

Fonte técnica: [Configuração de domínio personalizado no GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
