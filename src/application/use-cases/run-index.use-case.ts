import type { Logger } from "../ports/logger";
import type { TaskExecution } from "../../core/tasks/task-execution";

export interface RunIndexInput {
  targetPath: string;
  fullReindex: boolean;
  dryRun: boolean;
}

export class RunIndexUseCase {
  constructor(private readonly logger: Logger) {}

  async execute(input: RunIndexInput): Promise<TaskExecution> {
    this.logger.info("Executando stub de indexacao", {
      targetPath: input.targetPath,
      fullReindex: input.fullReindex,
      dryRun: input.dryRun
    });

    return {
      kind: "index",
      status: "stub",
      message: "Comando index pronto para receber pipeline real de indexacao."
    };
  }
}
