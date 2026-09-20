# Planos VIP e Asaas — JS Barbearia

A estrutura de planos, pagamentos, webhook e conciliação foi preservada. Não há planos/preços cadastrados pela seed da JS Barbearia e nenhuma conta Asaas foi conectada nesta etapa.

## Configuração futura

```env
VIP_ASAAS_PAYMENTS_ENABLED=false
ASAAS_ENVIRONMENT=sandbox
ASAAS_API_KEY=
ASAAS_WEBHOOK_TOKEN=
CRON_SECRET=
```

Preencher com valores próprios quando a configuração de pagamentos for solicitada. Manter cobranças desativadas até cadastrar os planos, validar a conta e homologar o fluxo.

O webhook usa `https://SEU-DOMINIO/api/webhooks/asaas` e valida `ASAAS_WEBHOOK_TOKEN` no cabeçalho `asaas-access-token`. A conciliação usa `https://SEU-DOMINIO/api/cron/vip-asaas-reconciliation` com `CRON_SECRET` no cabeçalho Bearer.

`scripts/run-vip-asaas-reconciliation.mjs` lê a URL pública do ambiente (`NEXT_PUBLIC_APP_URL`, `AUTH_URL` ou `NEXTAUTH_URL`). Não existe domínio fixo de outro cliente no script. Nenhuma tarefa agendada foi instalada.

## Testes e recursos preservados

- `scripts/test-vip-asaas-sandbox.ts` só aceita credenciais sandbox e cria objetos de homologação; só executar quando a conta de testes da JS estiver configurada.
- Testes unitários podem rodar sem ativar integrações. Testes de banco ficam condicionados a `VIP_INTEGRATION_TEST=1` e a um banco local descartável específico; não rodar contra produção.
- As funções de migração de assinantes legados foram mantidas por compatibilidade com o código-base. A JS começa sem assinantes legados.

Depois da homologação, configurar o ambiente de produção, registrar o webhook do domínio final e habilitar pagamentos explicitamente. Definir os contatos de notificação da JS antes de enviar mensagens reais.
