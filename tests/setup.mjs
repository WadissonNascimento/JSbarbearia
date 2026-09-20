import { registerHooks, createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { assertDisposableDatabase } from "./support/disposable-database.mjs";

// Next replaces this marker inside its server bundle. Node tests need the same
// server-only empty implementation without changing the application resolver.
const require = createRequire(import.meta.url);
const serverOnlyUrl = pathToFileURL(
  require.resolve("next/dist/compiled/server-only/empty.js"),
).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") {
      return { url: serverOnlyUrl, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});

const integrationEnabled =
  process.env.APPOINTMENT_INTEGRATION_TEST === "1" ||
  process.env.VIP_INTEGRATION_TEST === "1";

if (integrationEnabled) {
  assertDisposableDatabase();
} else {
  // Never let the regular unit suite contact the database from the app's .env.
  process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/js_unit_tests";
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

// Unit fixtures exercise enabled VIP billing independently of deployment state.
process.env.VIP_ASAAS_PAYMENTS_ENABLED = "true";
