import type { Logger } from "../ports/logger";
import type { TaskExecution } from "../../core/tasks/task-execution";

export interface BuildContextInput {
  taskId: string;
  format: "markdown" | "json";
}

export class BuildContextUseCase {
  constructor(private readonly logger: Logger) {}

  async execute(input: BuildContextInput): Promise<TaskExecution> {
    this.logger.info("Executando stub de geracao de contexto", {
      taskId: input.taskId,
      format: input.format
    });

    return {
      kind: "context",
      status: "stub",
      message: "Comando context pronto para receber context builder real."
    };
  }
}
