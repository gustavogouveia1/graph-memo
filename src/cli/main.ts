#!/usr/bin/env node
import { createCli } from "./create-cli";
import { writeCliRuntimeError } from "./user-error-output";
import { loadProjectConfig } from "../shared/config/load-project-config";

async function bootstrap(): Promise<void> {
  const config = await loadProjectConfig();
  const program = createCli(config);
  await program.parseAsync(process.argv);
}

void bootstrap().catch((error: unknown) => {
  writeCliRuntimeError(error);
  process.exitCode = 1;
});
