// Shared by the test preload and integration suites; never imported by the app.
export function assertDisposableDatabase() {
  for (const key of ["DATABASE_URL", "DIRECT_URL"]) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Configure ${key} para o banco descartável local de testes.`);
    }

    let url;
    try {
      url = new URL(value);
    } catch {
      throw new Error(`${key} inválida para testes de integração.`);
    }

    if (
      !["postgres:", "postgresql:"].includes(url.protocol) ||
      url.hostname !== "127.0.0.1" ||
      url.port !== "55439" ||
      url.pathname !== "/postgres" ||
      url.search ||
      url.hash
    ) {
      throw new Error("Testes de integração exigem banco descartável em 127.0.0.1:55439/postgres.");
    }
  }
}
