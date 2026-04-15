import { Command } from "commander";
import { join } from "node:path";

import { BuildContextUseCase } from "../application/use-cases/build-context.use-case";
import { ImportChatsUseCase } from "../application/use-cases/import-chats.use-case";
import { QueryIndexUseCase } from "../application/use-cases/query-index.use-case";
import { RunIndexUseCase } from "../application/use-cases/run-index.use-case";
import { NodeFileSystem } from "../infrastructure/filesystem/node-file-system";
import { FileChatImportReader } from "../infrastructure/ingestion/file-chat-import-reader";
import { FileKnowledgeWriter } from "../infrastructure/knowledge/file-knowledge-writer";
import { ConsoleLogger } from "../infrastructure/logging/console-logger";
import { TypeScriptSourceCodeParser } from "../infrastructure/parsing/typescript/typescript-source-code-parser";
import { FileIndexStore } from "../infrastructure/persistence/file-index-store";
import { FileIndexQueryReader } from "../infrastructure/persistence/file-index-query-reader";
import type { ProjectConfig } from "../shared/config/project-config";
import { registerContextCommand } from "./commands/register-context-command";
import { registerImportChatsCommand } from "./commands/register-import-chats-command";
import { registerIndexCommand } from "./commands/register-index-command";
import { registerQueryCommand } from "./commands/register-query-command";

export function createCli(config: ProjectConfig): Command {
  const logger = new ConsoleLogger(config.logLevel);
  const fileSystem = new NodeFileSystem();
  const sourceCodeParser = new TypeScriptSourceCodeParser();
  const indexStore = new FileIndexStore();
  const queryReader = new FileIndexQueryReader();
  const chatImportReader = new FileChatImportReader();
  const knowledgeWriter = new FileKnowledgeWriter();
  const runIndexUseCase = new RunIndexUseCase(logger, fileSystem, sourceCodeParser, indexStore);
  const queryIndexUseCase = new QueryIndexUseCase(logger, queryReader);
  const buildContextUseCase = new BuildContextUseCase(logger);
  const importChatsUseCase = new ImportChatsUseCase(
    logger,
    chatImportReader,
    knowledgeWriter,
    join(config.workspaceRoot, config.knowledgeDir)
  );

  const program = new Command();

  program
    .name("graphmemo")
    .description("CLI local do Graph-Memo")
    .version("0.1.0")
    .showHelpAfterError();

  registerIndexCommand(program, { runIndexUseCase });
  registerQueryCommand(program, { queryIndexUseCase });
  registerContextCommand(program, { buildContextUseCase });
  registerImportChatsCommand(program, { importChatsUseCase });

  return program;
}
