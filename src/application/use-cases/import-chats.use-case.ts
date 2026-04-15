import type { Logger } from "../ports/logger";
import type { TaskExecution } from "../../core/tasks/task-execution";

export interface ImportChatsInput {
  source: string;
  provider: "cursor" | "chatgpt" | "claude" | "generic";
  dryRun: boolean;
}

export class ImportChatsUseCase {
  constructor(private readonly logger: Logger) {}

  async execute(input: ImportChatsInput): Promise<TaskExecution> {
    this.logger.info("Executando stub de importacao de chats", {
      source: input.source,
      provider: input.provider,
      dryRun: input.dryRun
    });

    return {
      kind: "import-chats",
      status: "stub",
      message: "Comando import-chats pronto para receber pipeline de importacao."
    };
  }
}
