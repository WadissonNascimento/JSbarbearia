import { config } from "dotenv";
import { fileURLToPath } from "node:url";

config({ path: fileURLToPath(new URL("../.env", import.meta.url)), quiet: true });

const routes = {
  reminders: "/api/cron/appointment-reminders",
  agenda: "/api/cron/barber-daily-agenda",
};
const mode = process.argv[2];
if (!(mode in routes)) throw new Error("Use reminders ou agenda.");
if (!process.env.CRON_SECRET) throw new Error("CRON_SECRET não configurado.");

// Cron runs every five minutes in UTC; the morning window follows shop time.
if (mode === "agenda") {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo", hour: "2-digit", hourCycle: "h23",
  }).format(new Date());
  if (hour !== "08") process.exit(0);
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
if (!appUrl || new URL(appUrl).hostname !== "jsbarbearia.com") {
  throw new Error("A URL pública precisa apontar para jsbarbearia.com.");
}
const response = await fetch(new URL(routes[mode], appUrl), {
  method: "POST",
  headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  signal: AbortSignal.timeout(90000),
});
if (!response.ok) throw new Error(`Cron ${mode}: HTTP ${response.status}.`);
const result = await response.json();
console.log(JSON.stringify({ time: new Date().toISOString(), mode, result }));
if (result.failed > 0 || result.vipPayment?.failed > 0) process.exitCode = 1;
