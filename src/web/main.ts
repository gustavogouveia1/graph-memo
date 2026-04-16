#!/usr/bin/env node
import { createWebServer } from "./create-web-server";
import { loadProjectConfig } from "../shared/config/load-project-config";

async function bootstrap(): Promise<void> {
  const config = await loadProjectConfig();
  const server = createWebServer(config);
  const port = process.env.GRAPHMEMO_WEB_PORT === undefined ? 3210 : Number(process.env.GRAPHMEMO_WEB_PORT);

  server.listen(port, "127.0.0.1", () => {
    console.log(`Graph-Memo Web UI disponivel em http://127.0.0.1:${port}`);
  });
}

void bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Falha ao iniciar Graph-Memo Web UI.";
  console.error(message);
  process.exitCode = 1;
});
