# Domínio próprio da JS Barbearia

## Publicação atual — 19/09/2026

- URL: https://jsbarbearia.com (www redireciona para o domínio principal).
- VPS: 2.24.65.212; pasta: `/var/www/js-barbearia`.
- PM2: `js-barbearia`, escutando apenas em `127.0.0.1:3002`; lista salva e serviço PM2 habilitado.
- Nginx: `/etc/nginx/sites-available/js-barbearia`, com link em `sites-enabled`.
- DNS Hostinger: A `@` → `2.24.65.212`; CNAME `www` → `jsbarbearia.com`; TTL 300.
- Certificado Let's Encrypt para ambos os nomes; renovação pelo certbot.timer e hook `js-barbearia-nginx` para recarregar Nginx.
- Banco exclusivo da JS; `shop_js_barbearia.primaryDomain = jsbarbearia.com`.
- `.env` de produção configurado somente na VPS, com permissão 600. O `.env` local mantém as URLs de desenvolvimento.
- Build de produção concluído; HTTPS público 200; www 301; os outros dois sites responderam 200 após a publicação.
- Google OAuth, Resend e dados comerciais ainda precisam ser configurados.

As instruções abaixo são referência para manutenção. Para este domínio já publicado, preservar a configuração Nginx existente, incluindo www e o caminho ACME.

## Preparação

1. Subir a JS Barbearia como processo `js-barbearia`, com porta exclusiva. O padrão é `3002`; para alterar, definir `JS_APP_PORT` no ambiente do PM2 e do script de ativação.
2. Cadastrar o domínio em `Shop.primaryDomain` de `shop_js_barbearia` no novo banco.
3. Definir `NEXT_PUBLIC_APP_URL`, `AUTH_URL`, `ALLOWED_SERVER_ACTION_ORIGINS` e `DOMAIN_EXPECTED_IPV4S` para a nova instalação.
4. Configurar DNS do domínio para esse servidor e provisionar o webroot ACME `/var/www/letsencrypt` conforme a infraestrutura escolhida.

## Conferência sem alterações

```bash
npm run domain:check -- --domain SEU-DOMINIO
npm run domain:activate -- --domain SEU-DOMINIO
```

`domain:check` consulta cadastro e DNS sem alterar o banco ou o servidor. `domain:activate`, sem `--execute`, apresenta o plano. Ambos exigem configuração prévia do novo banco. O segundo também verifica a aplicação em `http://127.0.0.1:3002/api/domain-allow` (ou na porta `JS_APP_PORT`).

Sem `DOMAIN_EXPECTED_IPV4S`, a conferência fica pendente, pois não existe destino padrão.

## Aplicação do plano revisado

Somente na etapa de publicação, depois da revisão do domínio, certificado e servidor:

```bash
DOMAIN_ACTIVATION_ENABLED=1 npm run domain:activate -- --domain SEU-DOMINIO --execute
```

O script usa Certbot e Nginx, valida `nginx -t` e solicita o reload. O proxy preserva `Host`, `X-Forwarded-Host` e `X-Forwarded-Proto` para o app resolver a loja e os redirecionamentos. O destino é sempre a porta configurada para JS.

Depois, validar HTTPS, `/api/domain-allow`, login Google e links de e-mail usando o domínio final. Configurar o retorno OAuth `/api/auth/callback/google` e o domínio de envio do Resend conforme `docs/js-setup.md`.
