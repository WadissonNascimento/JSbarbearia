# Configuração da JS Barbearia

Projeto independente para Jean. Nesta etapa estão preparados código, identidade visual e migrations. O banco exclusivo da JS foi conectado e as 15 migrations foram aplicadas em 18/09/2026. Domínio, login Google e Resend aguardam configuração.

## 1. Banco e cadastro inicial

- Preencher `DATABASE_URL` e `DIRECT_URL` somente com conexões do novo banco. O schema usa PostgreSQL; as migrations de RLS esperam as roles `anon`, `authenticated` e `service_role` disponíveis no Supabase.
- Usar o novo projeto Supabase também para `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e o bucket `SUPABASE_STORAGE_BUCKET`, caso os uploads usem Storage.
- Após conferir o destino, executar `npm run prisma:deploy` e `npm run prisma:generate` na cópia JS.
- A seed cria apenas `shop_js_barbearia` (slug `js-barbearia`) e a identidade de e-mail com nome JS Barbearia. Não cria usuários, clientes, agendamentos, serviços, planos, preços, contatos nem domínio.
- Criar a conta administrativa do Jean e cadastrar equipe, horários, serviços e preços quando forem informados. Não há senha administrativa predefinida.

As migrations foram adaptadas para um banco novo. Não devem ser aplicadas ao banco da barbearia de origem nem usadas como uma atualização daquele projeto.

## 2. Domínio e publicação

- Definir o domínio de Jean e o servidor de destino; preencher `NEXT_PUBLIC_APP_URL` e `AUTH_URL` com a URL HTTPS final.
- Cadastrar esse domínio em `Shop.primaryDomain` da loja `shop_js_barbearia` e ajustar `ALLOWED_SERVER_ACTION_ORIGINS` com o host final.
- A aplicação PM2 usa o nome `js-barbearia` e a porta `3002` por padrão. `JS_APP_PORT` permite escolher outra porta livre, mantendo o mesmo valor no PM2 e no script de domínio.
- Definir `DOMAIN_EXPECTED_IPV4S` com o IP do servidor novo. Não há IP de produção herdado.
- Seguir `docs/custom-domains.md` depois que DNS, banco e aplicação estiverem configurados.

## 3. Google

- Configurar as credenciais OAuth destinadas à JS Barbearia em `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET` (também são aceitos os aliases `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`).
- Cadastrar no cliente OAuth a origem HTTPS final e o retorno `https://SEU-DOMINIO/api/auth/callback/google`, usando o domínio confirmado.
- Definir um `AUTH_SECRET` próprio. Reiniciar o processo depois de atualizar variáveis: o provider Google é carregado na inicialização.
- Validar entrada, saída e retorno para as telas da JS Barbearia. Sem ID e segredo configurados, o provider Google não é ativado.

## 4. Resend

- Configurar/verificar o domínio de envio da JS Barbearia no Resend e concluir os registros DNS fornecidos pelo serviço.
- Preencher `EMAIL_PROVIDER=resend`, `RESEND_API_KEY` e `EMAIL_FROM` com o remetente aprovado da JS Barbearia.
- Preencher os contatos próprios em `ShopEmailSettings.replyToEmail` e `notificationEmail` quando Jean os fornecer.
- Testar cadastro, recuperação de senha e notificações com destinatários de teste. Em desenvolvimento, a ausência de credenciais pode usar o fallback de console; isso não confirma entrega real.

## 5. Integrações posteriores

Asaas, web push e rotinas automáticas ficam para uma etapa posterior com credenciais, domínio e segredos próprios. Manter `VIP_ASAAS_PAYMENTS_ENABLED=false` até configurar os pagamentos. Nenhuma rotina deve apontar para o domínio de outro cliente.

## 6. Preços dos planos

Definir `JS_VIP_CORTE_PRICE`, `JS_VIP_CORTE_SOBRANCELHA_PRICE` e `JS_VIP_COMPLETO_PRICE` somente com preços aprovados por Jean. Enquanto houver preço pendente, os cartões exibem “A definir”, nenhuma definição de plano é semeada automaticamente e novas adesões ficam fechadas. Valores aceitam ponto ou vírgula decimal, sem símbolo de moeda.

## 7. Testes

`npm test` executa testes unitários com conexões de banco substituídas por um endereço local inacessível; os testes de integração ficam pulados por padrão. O bootstrap exige Node 22.15+ ou 24. As integrações só aceitam o banco descartável local descrito em `tests/setup.mjs`, mediante flags explícitas. Não executar integração com o banco real da JS.
