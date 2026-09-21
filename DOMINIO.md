# Domínio do catálogo

Endereço escolhido: **reidogadocarnes.com.br** (também com `www`).

## Situação em 21/09/2026

- Registro.br: domínio publicado, validade até 20/09/2030.
- Firebase: raiz e `www` autorizados; acessos anteriores preservados.
- DNS: quatro registros A e um CNAME `www` salvos e conferidos nos servidores oficiais e em resolvedores públicos.
- GitHub Pages: `reidogadocarnes.com.br` configurado como domínio personalizado e arquivo `CNAME` sincronizado.
- Propriedade: domínio verificado na conta `marcelomreidogado-cmd`; manter o TXT de verificação.
- HTTPS: emissão do certificado solicitada pelo GitHub; aguardando conclusão e testes finais.

## Referência da configuração

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
| TXT | _github-pages-challenge-marcelomreidogado-cmd | d77a1b0493ddc8d9f4c9bfb21e979b |

4. Aguardar a publicação dos registros e a emissão do certificado do GitHub Pages. Habilitar **Enforce HTTPS** quando disponível.
5. Testar catálogo, fotos, fontes, carrinho, checkout, entrada no painel e redirecionamentos (endereço antigo e `www`) no novo domínio. Não enviar mensagens reais às unidades durante testes.
6. Atualizar os links deste guia e do README, e gerar novamente o ZIP de entrega.

Links finais, depois da conexão:

- Catálogo: https://reidogadocarnes.com.br/
- Administração: https://reidogadocarnes.com.br/?view=admin

Fonte técnica: [Configuração de domínio personalizado no GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
