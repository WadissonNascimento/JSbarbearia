# RLS — código preparado para JS Barbearia

As migrations de segurança foram preservadas em `prisma/migrations/20260531161000_js_barbearia_security`, com as migrations adicionais de novas tabelas. Não foram executadas contra um banco da JS Barbearia nesta etapa.

O projeto usa Prisma no servidor, com validações de sessão, papel e escopo de loja. As políticas SQL protegem o acesso direto pelas roles Supabase `anon` e `authenticated` e usam:

- `app.current_user_id`
- `app.current_shop_id`
- `app.current_role`
- Claims JWT equivalentes, quando aplicáveis.

Depois de configurar o banco exclusivo da JS e executar as migrations, conferir tabelas com RLS, grants e políticas; validar separadamente os acessos de cliente, barbeiro e administrador. O acesso Prisma por uma role privilegiada pode ignorar RLS, por isso as validações do backend continuam necessárias.

Os testes estáticos `tests/security-rls.test.ts` verificam a presença das regras no código. Eles não substituem os testes de permissões no banco novo. Resultados históricos da instalação anterior não são evidência de validação da JS Barbearia.
