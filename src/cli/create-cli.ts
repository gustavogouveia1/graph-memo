import { Command } from "commander";
import type { ProjectConfig } from "../shared/config/project-config";
import { createRuntimeServices } from "../shared/bootstrap/create-runtime-services";
import { registerContextCommand } from "./commands/register-context-command";
import { registerImportChatsCommand } from "./commands/register-import-chats-command";
import { registerIndexCommand } from "./commands/register-index-command";
import { registerQueryCommand } from "./commands/register-query-command";

export function createCli(config: ProjectConfig): Command {
  const services = createRuntimeServices(config);

  const program = new Command();

  program
    .name("graphmemo")
    .description("CLI local do Graph-Memo")
    .version("0.1.0")
    .showHelpAfterError();

  registerIndexCommand(program, { runIndexUseCase: services.runIndexUseCase });
  registerQueryCommand(program, { queryIndexUseCase: services.queryIndexUseCase });
  registerContextCommand(program, {
    buildContextUseCase: services.buildContextUseCase,
    refineContextUseCase: services.refineContextUseCase
  });
  registerImportChatsCommand(program, { importChatsUseCase: services.importChatsUseCase });

  return program;
}
