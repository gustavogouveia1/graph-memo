import type { Command } from "commander";

import type { ImportChatsUseCase } from "../../application/use-cases/import-chats.use-case";
import { printTaskExecution } from "../output/print-task-execution";

interface RegisterImportChatsCommandDependencies {
  importChatsUseCase: ImportChatsUseCase;
}

interface ImportChatsCommandOptions {
  source: string;
  provider: "cursor" | "chatgpt" | "claude" | "generic";
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
    .option("--provider <provider>", "Fonte dos chats (cursor|chatgpt|claude|generic)", "generic")
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
