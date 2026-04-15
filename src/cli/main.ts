#!/usr/bin/env node
import { createCli } from "./create-cli";
import { GraphMemoError } from "../core/errors/graphmemo-error";
import { loadProjectConfig } from "../shared/config/load-project-config";

async function bootstrap(): Promise<void> {
  const config = await loadProjectConfig();
  const program = createCli(config);
  await program.parseAsync(process.argv);
}

void bootstrap().catch((error: unknown) => {
  if (error instanceof GraphMemoError) {
    console.error(`[${error.code}] ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const message = error instanceof Error ? error.message : "Erro inesperado na execucao da CLI.";
  console.error(message);
  process.exitCode = 1;
});
