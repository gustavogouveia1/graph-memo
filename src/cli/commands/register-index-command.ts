import type { Command } from "commander";

import type { RunIndexUseCase } from "../../application/use-cases/run-index.use-case";
import { printTaskExecution } from "../output/print-task-execution";

interface RegisterIndexCommandDependencies {
  runIndexUseCase: RunIndexUseCase;
}

interface IndexCommandOptions {
  full: boolean;
  dryRun: boolean;
}

export function registerIndexCommand(
  program: Command,
  dependencies: RegisterIndexCommandDependencies
): void {
  program
    .command("index")
    .description("Prepara e executa indexacao local do projeto")
    .argument("[targetPath]", "Diretorio alvo para indexacao", ".")
    .option("--full", "Forca reindexacao completa", false)
    .option("--dry-run", "Executa sem persistir alteracoes", false)
    .action(async (targetPath: string, options: IndexCommandOptions) => {
      const result = await dependencies.runIndexUseCase.execute({
        targetPath,
        fullReindex: options.full,
        dryRun: options.dryRun
      });

      printTaskExecution(result);
    });
}
