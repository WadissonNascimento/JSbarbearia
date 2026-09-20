import { config } from "dotenv";
import { fileURLToPath } from "node:url";

config({ path: fileURLToPath(new URL("../.env", import.meta.url)), quiet: true });

const secret = process.env.CRON_SECRET;
if (!secret) throw new Error("CRON_SECRET não configurado.");

const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || process.env.NEXTAUTH_URL;
if (!configuredAppUrl) throw new Error("Configure a URL pública da JS Barbearia.");
const reconciliationUrl = new URL("/api/cron/vip-asaas-reconciliation", configuredAppUrl);
if (!["http:", "https:"].includes(reconciliationUrl.protocol)) {
  throw new Error("A URL pública deve usar HTTP ou HTTPS.");
}
reconciliationUrl.searchParams.set("run", String(Date.now()));

const response = await fetch(
  reconciliationUrl,
  {
    cache: "no-store",
    headers: { authorization: `Bearer ${secret}` },
  }
);

if (!response.ok) {
  throw new Error(`Reconciliação VIP respondeu HTTP ${response.status}.`);
}
