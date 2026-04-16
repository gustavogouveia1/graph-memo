import { join, resolve } from "node:path";

import type { ChatImportReaderPort } from "../ports/chat-import-reader";
import type { KnowledgeWriterPort } from "../ports/knowledge-writer";
import type { Logger } from "../ports/logger";
import type { ChatImportProvider } from "../../core/chat-import/chat-import-provider";
import { normalizeImportedChat } from "../../core/chat-import/normalize-imported-chat";
import { GraphMemoError } from "../../core/errors/graphmemo-error";
import type { TaskExecution } from "../../core/tasks/task-execution";

export interface ImportChatsInput {
  source: string;
  provider: ChatImportProvider;
  dryRun: boolean;
  workspacePath?: string;
}

interface ImportChatsSummary {
  sourcePath: string;
  provider: ChatImportProvider;
  importedAt: string;
  scannedFilesCount: number;
  parsedFilesCount: number;
  fallbackFilesCount: number;
  importedChatsCount: number;
  generatedNotesCount: number;
  persistedNotesCount: number;
  outputDirectory: string;
  dryRun: boolean;
}

export class ImportChatsUseCase {
  constructor(
    private readonly logger: Logger,
    private readonly chatImportReader: ChatImportReaderPort,
    private readonly knowledgeWriter: KnowledgeWriterPort,
    private readonly knowledgeDirectory: string,
    private readonly defaultWorkspaceRoot: string
  ) {}

  async execute(input: ImportChatsInput): Promise<TaskExecution> {
    this.validateInput(input);
    const sourcePath = resolve(input.source);
    const workspaceRoot = resolve(input.workspacePath ?? this.defaultWorkspaceRoot);
    const knowledgeRootPath = join(workspaceRoot, this.knowledgeDirectory);
    const importedAt = new Date().toISOString();

    this.logger.info("Iniciando importacao de chats para knowledge/", {
      sourcePath,
      provider: input.provider,
      dryRun: input.dryRun,
      correlationId: "import-chats"
    });

    try {
      const readResult = await this.chatImportReader.read({
        sourcePath,
        provider: input.provider
      });

      const normalizedNotes = readResult.chats.map((chat, index) =>
        normalizeImportedChat({
          chat,
          importedAt,
          noteIndex: index
        })
      );

      const persistedNotes =
        input.dryRun || normalizedNotes.length === 0
          ? []
          : await this.knowledgeWriter.writeChatNotes(knowledgeRootPath, normalizedNotes);

      const summary: ImportChatsSummary = {
        sourcePath,
        provider: input.provider,
        importedAt,
        scannedFilesCount: readResult.scannedFilesCount,
        parsedFilesCount: readResult.parsedFilesCount,
        fallbackFilesCount: readResult.fallbackFilesCount,
        importedChatsCount: readResult.chats.length,
        generatedNotesCount: normalizedNotes.length,
        persistedNotesCount: persistedNotes.length,
        outputDirectory: `${knowledgeRootPath}/imports`,
        dryRun: input.dryRun
      };

      this.logger.info("Importacao de chats concluida", {
        ...summary,
        correlationId: "import-chats"
      });

      return {
        kind: "import-chats",
        status: "success",
        message: this.buildSuccessMessage(summary),
        details: {
          ...summary,
          generatedNotes: normalizedNotes.map((note) => note.noteFileName),
          persistedNotes: persistedNotes.map((note) => note.relativePath)
        }
      };
    } catch (error: unknown) {
      if (error instanceof GraphMemoError) {
        throw error;
      }

      this.logger.error("Falha inesperada na importacao de chats", {
        sourcePath,
        provider: input.provider,
        correlationId: "import-chats",
        error: error instanceof Error ? error.message : "erro-desconhecido"
      });

      throw new GraphMemoError(
        "IMPORT_CHATS_FAILED",
        "Falha ao importar chats. Verifique o caminho de origem e o formato dos arquivos.",
        error,
        { sourcePath, provider: input.provider }
      );
    }
  }

  private validateInput(input: ImportChatsInput): void {
    if (input.source.trim().length === 0) {
      throw new GraphMemoError(
        "IMPORT_CHATS_INVALID_INPUT",
        "Informe um caminho de origem valido com --source <path>."
      );
    }
  }

  private buildSuccessMessage(summary: ImportChatsSummary): string {
    const persistence = summary.dryRun
      ? "sem persistencia (--dry-run)"
      : `${summary.persistedNotesCount} nota(s) persistida(s) em knowledge/imports/`;

    return `Importacao concluida: ${summary.importedChatsCount} chat(s) normalizado(s), ${summary.parsedFilesCount}/${summary.scannedFilesCount} arquivo(s) parseado(s), ${summary.fallbackFilesCount} com fallback generic, ${persistence}.`;
  }
}
