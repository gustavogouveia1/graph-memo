import type {
  AiContextRefinerPort,
  RefinedContextOutput
} from "../ports/ai-context-refiner";
import type { Logger } from "../ports/logger";
import type { BuildContextInput, BuildContextUseCase } from "./build-context.use-case";
import type { BuiltContextPackage } from "../../core/context/context-types";
import { GraphMemoError } from "../../core/errors/graphmemo-error";
import type { TaskExecution } from "../../core/tasks/task-execution";

export type RefineContextInput = BuildContextInput;
export interface AiRefinementRuntimeConfig {
  enabled: boolean;
  apiKey: string;
}

interface ContextRefinementResult {
  status: "success" | "skipped" | "failed";
  message: string;
  reasonCode?: string;
  output?: RefinedContextOutput;
}

interface RefinedContextDetails {
  deterministicContext: BuiltContextPackage;
  refinement: ContextRefinementResult;
}

export class RefineContextUseCase {
  constructor(
    private readonly logger: Logger,
    private readonly buildContextUseCase: BuildContextUseCase,
    private readonly aiContextRefiner: AiContextRefinerPort,
    private readonly aiRefinementConfig: AiRefinementRuntimeConfig
  ) {}

  async execute(input: RefineContextInput): Promise<TaskExecution> {
    const deterministicContext = await this.buildDeterministicContext(input);
    const refinement = await this.tryRefineContext(deterministicContext);

    return {
      kind: "context",
      status: "success",
      message: this.buildMessage(deterministicContext, refinement),
      details: {
        deterministicContext,
        refinement
      } satisfies RefinedContextDetails
    };
  }

  private async buildDeterministicContext(input: RefineContextInput): Promise<BuiltContextPackage> {
    const deterministicResult = await this.buildContextUseCase.execute({
      ...input,
      format: "json"
    });

    const details = deterministicResult.details;
    if (!isBuiltContextPackage(details)) {
      throw new GraphMemoError(
        "AI_REFINEMENT_INVALID_RESPONSE",
        "Nao foi possivel obter o contexto deterministico em formato estruturado para o refinamento."
      );
    }

    return details;
  }

  private async tryRefineContext(
    deterministicContext: BuiltContextPackage
  ): Promise<ContextRefinementResult> {
    if (!this.aiRefinementConfig.enabled) {
      return {
        status: "skipped",
        reasonCode: "AI_REFINEMENT_DISABLED",
        message: "Refinamento por IA desativado na configuracao."
      };
    }
    if (this.aiRefinementConfig.apiKey.trim().length === 0) {
      return {
        status: "skipped",
        reasonCode: "AI_REFINEMENT_NOT_CONFIGURED",
        message: "Refinamento por IA ativado, mas sem chave de API configurada."
      };
    }

    try {
      const output = await this.aiContextRefiner.refineContext({
        task: deterministicContext.task,
        deterministicContext
      });

      return {
        status: "success",
        message: "Refinamento concluido com sucesso.",
        output
      };
    } catch (error: unknown) {
      const reasonCode = error instanceof GraphMemoError ? error.code : "AI_REFINEMENT_FAILED";
      const reasonMessage =
        error instanceof GraphMemoError
          ? error.message
          : "Falha inesperada ao processar refinamento por IA.";

      this.logger.warn("Refinamento por IA indisponivel; mantendo resultado deterministico", {
        correlationId: "context-refinement",
        reasonCode,
        reasonMessage
      });

      return {
        status: "failed",
        reasonCode,
        message: reasonMessage
      };
    }
  }

  private buildMessage(
    deterministicContext: BuiltContextPackage,
    refinement: ContextRefinementResult
  ): string {
    return `Contexto deterministico gerado com ${deterministicContext.relevantFiles.length} arquivo(s); refinamento IA: ${refinement.status}.`;
  }
}

function isBuiltContextPackage(value: unknown): value is BuiltContextPackage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.task === "string" &&
    Array.isArray(candidate.relevantFiles) &&
    Array.isArray(candidate.relevantSymbols) &&
    Array.isArray(candidate.relevantModules) &&
    Array.isArray(candidate.fileRelations) &&
    Array.isArray(candidate.relevantKnowledgeNotes) &&
    Array.isArray(candidate.relevantAdrsAndDocs) &&
    Array.isArray(candidate.suggestedStartingPoints)
  );
}
