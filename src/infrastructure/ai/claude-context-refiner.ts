import type {
  AiContextRefinerPort,
  RefineContextInput,
  RefinedContextOutput
} from "../../application/ports/ai-context-refiner";
import { GraphMemoError } from "../../core/errors/graphmemo-error";
import type { AiRefinementConfig } from "../../shared/config/project-config";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

interface ClaudeMessageResponse {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
}

export class ClaudeContextRefiner implements AiContextRefinerPort {
  constructor(private readonly config: AiRefinementConfig) {}

  async refineContext(input: RefineContextInput): Promise<RefinedContextOutput> {
    const prompt = buildPrompt(input);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.config.timeoutMs);

    try {
      const response = await fetch(CLAUDE_API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.config.apiKey,
          "anthropic-version": ANTHROPIC_VERSION
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: 1200,
          temperature: 0,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new GraphMemoError(
          "AI_REFINEMENT_FAILED",
          `Claude retornou erro HTTP ${response.status} durante refinamento.`
        );
      }

      const payload = (await response.json()) as ClaudeMessageResponse;
      const text = payload.content
        ?.filter((chunk) => chunk.type === "text")
        .map((chunk) => chunk.text ?? "")
        .join("\n")
        .trim();

      if (text === undefined || text.length === 0) {
        throw new GraphMemoError(
          "AI_REFINEMENT_INVALID_RESPONSE",
          "Claude retornou resposta vazia para refinamento."
        );
      }

      const parsed = parseJsonFromText(text);
      if (!isRefinedContextOutput(parsed)) {
        throw new GraphMemoError(
          "AI_REFINEMENT_INVALID_RESPONSE",
          "Claude retornou um payload fora do contrato esperado de refinamento."
        );
      }

      return parsed;
    } catch (error: unknown) {
      if (error instanceof GraphMemoError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new GraphMemoError(
          "AI_REFINEMENT_FAILED",
          `Tempo limite excedido ao chamar Claude (${this.config.timeoutMs}ms).`,
          error
        );
      }

      throw new GraphMemoError(
        "AI_REFINEMENT_FAILED",
        "Falha ao chamar Claude para refinamento de contexto.",
        error
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

function buildPrompt(input: RefineContextInput): string {
  return [
    "Voce esta refinando um pacote de contexto deterministico do Graph-Memo.",
    "Regras obrigatorias:",
    "- NAO invente arquivos, riscos ou decisoes que nao estejam no contexto.",
    "- Nao altere a verdade de retrieval/ranking; apenas organize e sintetize.",
    "- Quando faltar informacao, declare incerteza explicitamente.",
    "- Retorne JSON valido estritamente no formato solicitado.",
    "",
    "Formato JSON obrigatorio:",
    JSON.stringify(
      {
        summary: "string",
        refinedTaskBrief: "string",
        keyFiles: ["string"],
        keyRisks: ["string"],
        suggestedImplementationFocus: ["string"],
        suggestedStartingPoint: "string",
        implementationPrompt: "string",
        promptPackage: {
          objective: "string",
          constraints: ["string"],
          contextHighlights: ["string"],
          suggestedPrompt: "string"
        }
      },
      null,
      2
    ),
    "",
    "Task original:",
    input.task,
    "",
    "Contexto deterministico (fonte da verdade):",
    JSON.stringify(input.deterministicContext, null, 2)
  ].join("\n");
}

function parseJsonFromText(text: string): unknown {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fenceMatch?.[1]?.trim() ?? trimmed;
  return JSON.parse(candidate);
}

function isRefinedContextOutput(value: unknown): value is RefinedContextOutput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const promptPackage = candidate.promptPackage;

  return (
    typeof candidate.summary === "string" &&
    typeof candidate.refinedTaskBrief === "string" &&
    Array.isArray(candidate.keyFiles) &&
    candidate.keyFiles.every((entry) => typeof entry === "string") &&
    Array.isArray(candidate.keyRisks) &&
    candidate.keyRisks.every((entry) => typeof entry === "string") &&
    Array.isArray(candidate.suggestedImplementationFocus) &&
    candidate.suggestedImplementationFocus.every((entry) => typeof entry === "string") &&
    typeof candidate.suggestedStartingPoint === "string" &&
    typeof candidate.implementationPrompt === "string" &&
    typeof promptPackage === "object" &&
    promptPackage !== null &&
    typeof (promptPackage as Record<string, unknown>).objective === "string" &&
    Array.isArray((promptPackage as Record<string, unknown>).constraints) &&
    ((promptPackage as Record<string, unknown>).constraints as unknown[]).every(
      (entry) => typeof entry === "string"
    ) &&
    Array.isArray((promptPackage as Record<string, unknown>).contextHighlights) &&
    ((promptPackage as Record<string, unknown>).contextHighlights as unknown[]).every(
      (entry) => typeof entry === "string"
    ) &&
    typeof (promptPackage as Record<string, unknown>).suggestedPrompt === "string"
  );
}
