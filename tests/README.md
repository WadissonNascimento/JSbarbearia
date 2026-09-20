# Testes

A suíte padrão usa Node 24 com o preload `tests/setup.mjs`, antes de `tsx`:

```bash
node --import ./tests/setup.mjs --import tsx --test tests/**/*.test.ts
```

O preload resolve o marcador `server-only` pela implementação de servidor incluída no Next, ativa a condição VIP dos mocks e substitui as URLs de banco por um localhost inacessível. Ele não lê `.env`. Assim, testes unitários não usam o banco da JS Barbearia.

`appointment-flow.test.ts` só executa com `APPOINTMENT_INTEGRATION_TEST=1`. Os testes de webhook exigem `VIP_INTEGRATION_TEST=1`. Em ambos os casos, `DATABASE_URL` e `DIRECT_URL` devem apontar explicitamente para o PostgreSQL descartável em `127.0.0.1:55439/postgres`, sem parâmetros de URL. Preparar o schema e a seed da JS nesse banco local antes dos testes de agendamento. O teste de webhook mantém sua exigência adicional de usuário local `wadisson`.

Nunca utilizar o banco real de um cliente para essa suíte de integração. Nenhum banco descartável é criado automaticamente pelo comando de testes.
