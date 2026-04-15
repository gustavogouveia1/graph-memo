import type { Command } from "commander";

import type { BuildContextUseCase } from "../../application/use-cases/build-context.use-case";
import { printTaskExecution } from "../output/print-task-execution";

interface RegisterContextCommandDependencies {
  buildContextUseCase: BuildContextUseCase;
}

interface ContextCommandOptions {
  task: string;
  format: "markdown" | "json";
  symbol?: string;
  file?: string;
  module?: string;
  caseSensitive: boolean;
  exactMatch: boolean;
}

export function registerContextCommand(
  program: Command,
  dependencies: RegisterContextCommandDependencies
): void {
  program
    .command("context")
    .description("Gera contexto consolidado para uma task textual")
    .argument("[targetPath]", "Diretorio raiz onde existe .graphmemo/", ".")
    .requiredOption("--task <taskText>", "Descricao textual da task de destino")
    .option("--format <format>", "Formato de saida (markdown|json)", "markdown")
    .option("--symbol <name>", "Prioriza contexto relacionado ao simbolo informado")
    .option("--file <relativePath>", "Prioriza contexto relacionado ao arquivo informado")
    .option("--module <source>", "Prioriza contexto relacionado ao modulo informado")
    .option("--case-sensitive", "Compara texto com diferenca entre maiusculas/minusculas", false)
    .option("--no-case-sensitive", "Compara texto sem diferenca entre maiusculas/minusculas")
    .option("--exact-match", "Exige comparacao exata", false)
    .option("--no-exact-match", "Permite comparacao parcial por contains")
    .action(async (targetPath: string, options: ContextCommandOptions) => {
      const input = {
        targetPath,
        task: options.task,
        format: options.format,
        caseSensitive: options.caseSensitive,
        exactMatch: options.exactMatch
      };
      if (options.symbol !== undefined) {
        Object.assign(input, { symbol: options.symbol });
      }
      if (options.file !== undefined) {
        Object.assign(input, { file: options.file });
      }
      if (options.module !== undefined) {
        Object.assign(input, { moduleSource: options.module });
      }

      const result = await dependencies.buildContextUseCase.execute(input);

      printTaskExecution(result);
    });
}
