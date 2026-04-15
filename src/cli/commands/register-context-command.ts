import type { Command } from "commander";

import type { BuildContextUseCase } from "../../application/use-cases/build-context.use-case";
import { printTaskExecution } from "../output/print-task-execution";

interface RegisterContextCommandDependencies {
  buildContextUseCase: BuildContextUseCase;
}

interface ContextCommandOptions {
  task: string;
  format: "markdown" | "json";
}

export function registerContextCommand(
  program: Command,
  dependencies: RegisterContextCommandDependencies
): void {
  program
    .command("context")
    .description("Gera contexto consolidado para uma task")
    .requiredOption("--task <taskId>", "Identificador da task de destino")
    .option("--format <format>", "Formato de saida (markdown|json)", "markdown")
    .action(async (options: ContextCommandOptions) => {
      const result = await dependencies.buildContextUseCase.execute({
        taskId: options.task,
        format: options.format
      });

      printTaskExecution(result);
    });
}
