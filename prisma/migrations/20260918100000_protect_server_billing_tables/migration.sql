-- These server-only billing tables were created after the baseline RLS migration.
BEGIN;
ALTER TABLE public."SystemBillingPayment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AsaasWebhookEvent" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."SystemBillingPayment", public."AsaasWebhookEvent" FROM PUBLIC, anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public."SystemBillingPayment", public."AsaasWebhookEvent" TO service_role;
COMMIT;
