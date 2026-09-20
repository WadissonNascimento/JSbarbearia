# JS Barbearia

Cópia independente do sistema de agendamento, preparada para a barbearia do Jean. A estrutura das telas foi preservada e a identidade foi adaptada à logo fornecida, em preto, prata e branco.

## Estado atual

- Banco exclusivo da JS conectado; 15 migrations aplicadas em 18/09/2026, com identidade inicial da barbearia.
- Logo, favicon, nome do aplicativo, notificações e paleta atualizados.
- Clientes, agendamentos, equipe, serviços e planos iniciam sem registros herdados.
- Domínio, Google, Resend, Storage, contatos, preços e conta administrativa aguardam configuração.
- Nenhuma publicação feita. Prévia local na porta 3002.

## Desenvolvimento

Requisitos: Node.js 24, dependências do projeto instaladas e arquivo `.env` privado. O `.env.example` é um modelo sem credenciais.

```bash
npm install
npm run prisma:generate
npm run dev
```

Abrir http://localhost:3002. O ambiente local configurado usa o banco exclusivo informado para a JS. Não colocar `.env` no controle de versão nem copiar credenciais de outra barbearia.

```bash
npm test
npm run build
```

A suíte padrão não usa o banco real. Os testes de integração exigem um banco descartável local e ficam pulados por padrão.

As próximas etapas estão em [docs/js-setup.md](docs/js-setup.md).

## Verificação desta entrega

- Compilação de produção e TypeScript concluídos.
- 55 testes aprovados; 13 integrações puladas por exigirem banco descartável.
- Estrutura do banco conferida contra o schema: nenhuma divergência.
- 39 tabelas da aplicação com RLS; sem usuários, agendamentos, serviços ou planos importados.
- Página inicial, login e planos inspecionados no navegador; página inicial conferida também em 390 px.
- Projeto original do Pedro permaneceu sem alterações.
