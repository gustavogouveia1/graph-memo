import { BuildContextUseCase } from "../../application/use-cases/build-context.use-case";
import { ImportChatsUseCase } from "../../application/use-cases/import-chats.use-case";
import { QueryIndexUseCase } from "../../application/use-cases/query-index.use-case";
import { RunIndexUseCase } from "../../application/use-cases/run-index.use-case";
import { NodeFileSystem } from "../../infrastructure/filesystem/node-file-system";
import { FileChatImportReader } from "../../infrastructure/ingestion/file-chat-import-reader";
import { FileKnowledgeContextReader } from "../../infrastructure/knowledge/file-knowledge-context-reader";
import { FileKnowledgeWriter } from "../../infrastructure/knowledge/file-knowledge-writer";
import { ConsoleLogger } from "../../infrastructure/logging/console-logger";
import { TypeScriptSourceCodeParser } from "../../infrastructure/parsing/typescript/typescript-source-code-parser";
import { FileIndexStore } from "../../infrastructure/persistence/file-index-store";
import { FileIndexQueryReader } from "../../infrastructure/persistence/file-index-query-reader";
import type { ProjectConfig } from "../config/project-config";

export interface RuntimeServices {
  runIndexUseCase: RunIndexUseCase;
  queryIndexUseCase: QueryIndexUseCase;
  buildContextUseCase: BuildContextUseCase;
  importChatsUseCase: ImportChatsUseCase;
}

export function createRuntimeServices(config: ProjectConfig): RuntimeServices {
  const logger = new ConsoleLogger(config.logLevel);
  const fileSystem = new NodeFileSystem();
  const sourceCodeParser = new TypeScriptSourceCodeParser();
  const indexStore = new FileIndexStore();
  const queryReader = new FileIndexQueryReader();
  const chatImportReader = new FileChatImportReader();
  const knowledgeWriter = new FileKnowledgeWriter();
  const knowledgeContextReader = new FileKnowledgeContextReader(fileSystem, {
    knowledgeDirectory: config.knowledgeDir,
    docsDirectory: config.docsDir
  });

  return {
    runIndexUseCase: new RunIndexUseCase(logger, fileSystem, sourceCodeParser, indexStore),
    queryIndexUseCase: new QueryIndexUseCase(logger, queryReader),
    buildContextUseCase: new BuildContextUseCase(logger, queryReader, knowledgeContextReader),
    importChatsUseCase: new ImportChatsUseCase(
      logger,
      chatImportReader,
      knowledgeWriter,
      config.knowledgeDir,
      config.workspaceRoot
    )
  };
}
