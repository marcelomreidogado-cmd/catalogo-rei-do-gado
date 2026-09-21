# Domínio do catálogo

- **Catálogo:** https://reidogadocarnes.com.br/
- **Administração:** https://reidogadocarnes.com.br/?view=admin
- **Com www:** https://www.reidogadocarnes.com.br/ redireciona para o endereço principal.
- O endereço anterior do GitHub Pages também redireciona para o domínio próprio.

## Configuração concluída em 21/09/2026

O domínio está registrado no Registro.br até 20/09/2030. O catálogo continua hospedado no GitHub Pages e usa o mesmo Firebase, banco de dados, produtos e administração. O painel agora usa um único acesso para as três unidades.

O GitHub aprovou o certificado para os endereços com e sem `www`. A opção **Enforce HTTPS** está ativada. O domínio também está verificado na conta `marcelomreidogado-cmd`.

Os dois endereços foram autorizados no Firebase. Os endereços antigos continuam autorizados. O arquivo `CNAME` na raiz do repositório contém `reidogadocarnes.com.br` e deve ser mantido nas próximas publicações.

## Registros no Registro.br

| Tipo | Nome no Registro.br | Destino |
|---|---|---|
| A | vazio (raiz) | 185.199.108.153 |
| A | vazio (raiz) | 185.199.109.153 |
| A | vazio (raiz) | 185.199.110.153 |
| A | vazio (raiz) | 185.199.111.153 |
| CNAME | www | marcelomreidogado-cmd.github.io |
| TXT | _github-pages-challenge-marcelomreidogado-cmd | d77a1b0493ddc8d9f4c9bfb21e979b |

Para a raiz, o campo nome fica vazio: o Registro.br não aceita `@`. Mantenha o registro TXT para preservar a verificação de propriedade no GitHub.

## Validação

- Registros salvos e conferidos nos servidores oficiais do Registro.br e nos resolvedores públicos do Google e Cloudflare.
- Certificado válido para raiz e `www`, sem ignorar erros de segurança.
- Catálogo, fotos, fontes, leitura em celular, sacola e escolha final das três unidades conferidos.
- Login único e leitura de produtos conferidos nas unidades Coronel, Bingen e Corrêas.
- Redirecionamentos do endereço antigo e de `www` conferidos.
- Nenhum pedido de teste registrado nem mensagem enviada às lojas.

Na primeira verificação, o resolvedor da rede local ainda não retornava o novo endereço. Os testes completos de navegador foram executados com o IP oficial do GitHub Pages confirmado pelo DNS, mantendo a validação normal de HTTPS. Algumas redes podem precisar de mais tempo para atualizar suas respostas de DNS.

Fonte técnica: [Configuração de domínio personalizado no GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
