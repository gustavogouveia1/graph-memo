import { Command } from "commander";

import { BuildContextUseCase } from "../application/use-cases/build-context.use-case";
import { ImportChatsUseCase } from "../application/use-cases/import-chats.use-case";
import { RunIndexUseCase } from "../application/use-cases/run-index.use-case";
import { ConsoleLogger } from "../infrastructure/logging/console-logger";
import type { ProjectConfig } from "../shared/config/project-config";
import { registerContextCommand } from "./commands/register-context-command";
import { registerImportChatsCommand } from "./commands/register-import-chats-command";
import { registerIndexCommand } from "./commands/register-index-command";

export function createCli(config: ProjectConfig): Command {
  const logger = new ConsoleLogger(config.logLevel);
  const runIndexUseCase = new RunIndexUseCase(logger);
  const buildContextUseCase = new BuildContextUseCase(logger);
  const importChatsUseCase = new ImportChatsUseCase(logger);

  const program = new Command();

  program
    .name("graphmemo")
    .description("CLI local do Graph-Memo")
    .version("0.1.0")
    .showHelpAfterError();

  registerIndexCommand(program, { runIndexUseCase });
  registerContextCommand(program, { buildContextUseCase });
  registerImportChatsCommand(program, { importChatsUseCase });

  return program;
}
