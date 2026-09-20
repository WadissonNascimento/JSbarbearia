const appPort = Number(process.env.JS_APP_PORT || "3002");
if (!Number.isInteger(appPort) || appPort < 1 || appPort > 65535) {
  throw new Error("JS_APP_PORT deve ser uma porta válida.");
}

module.exports = {
  apps: [
    {
      name: "js-barbearia",
      script: "node_modules/next/dist/bin/next",
      args: `start -H 127.0.0.1 -p ${appPort}`,
      exec_mode: "fork",
      instances: 1,
      max_memory_restart: "450M",
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: "production",
        PORT: String(appPort),
      },
    },
  ],
};
