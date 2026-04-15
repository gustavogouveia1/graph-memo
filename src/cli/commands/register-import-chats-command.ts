import type { Command } from "commander";

import type { ImportChatsUseCase } from "../../application/use-cases/import-chats.use-case";
import { CHAT_IMPORT_PROVIDERS, type ChatImportProvider } from "../../core/chat-import/chat-import-provider";
import { GraphMemoError } from "../../core/errors/graphmemo-error";
import { printTaskExecution } from "../output/print-task-execution";

interface RegisterImportChatsCommandDependencies {
  importChatsUseCase: ImportChatsUseCase;
}

interface ImportChatsCommandOptions {
  source: string;
  provider: ChatImportProvider;
  dryRun: boolean;
}

export function registerImportChatsCommand(
  program: Command,
  dependencies: RegisterImportChatsCommandDependencies
): void {
  program
    .command("import-chats")
    .description("Importa historico de chats para memoria local")
    .requiredOption("--source <path>", "Caminho de origem dos arquivos de chat")
    .option(
      "--provider <provider>",
      "Fonte dos chats (cursor|chatgpt|claude|generic)",
      parseProviderOption,
      "generic"
    )
    .option("--dry-run", "Executa sem persistir alteracoes", false)
    .action(async (options: ImportChatsCommandOptions) => {
      const result = await dependencies.importChatsUseCase.execute({
        source: options.source,
        provider: options.provider,
        dryRun: options.dryRun
      });

      printTaskExecution(result);
    });
}

function parseProviderOption(value: string): ChatImportProvider {
  if ((CHAT_IMPORT_PROVIDERS as readonly string[]).includes(value)) {
    return value as ChatImportProvider;
  }

  throw new GraphMemoError(
    "IMPORT_CHATS_INVALID_PROVIDER",
    `Provider invalido: ${value}. Use um destes: ${CHAT_IMPORT_PROVIDERS.join(", ")}.`
  );
}
