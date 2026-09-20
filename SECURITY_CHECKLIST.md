# Segurança — preparação da JS Barbearia

Este documento descreve o código copiado e as validações pendentes da nova instalação. Não comprova configuração de nenhum banco ou serviço externo da JS Barbearia.

## Preparado no projeto

- Configuração própria por ambiente; banco, credenciais e backups da origem não fazem parte desta cópia.
- Identificador `shop_js_barbearia` em schema, migrations e seed.
- Schema PostgreSQL, migrations de RLS, validações de sessão/papel e escopo por loja preservados.
- Seed sem usuários, clientes, agendamentos, preços, contatos ou domínio de outro cliente.
- Scripts de domínio e cobrança sem domínio/IP de produção herdado.

## Validar na configuração do novo ambiente

- Conferir `DATABASE_URL` e `DIRECT_URL` antes de aplicar migrations somente no novo banco.
- Aplicar e verificar RLS no projeto Supabase da JS Barbearia.
- Criar credenciais próprias para autenticação, Google, Resend, Storage e futuras integrações.
- Testar permissões de cliente, barbeiro e administrador usando contas de teste da JS.
- Validar URLs HTTPS, domínio de envio, callbacks OAuth e destinos de tarefas automáticas.

Segredos (`AUTH_SECRET`, credenciais de banco, Google, Resend, Storage e pagamentos) ficam no servidor e fora do Git. Variáveis `NEXT_PUBLIC_*` são públicas e não devem conter segredos.

Veja `docs/js-setup.md` para a sequência de configuração.
