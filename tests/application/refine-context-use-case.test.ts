import { describe, expect, it, vi } from "vitest";

import type {
  AiContextRefinerPort,
  RefinedContextOutput
} from "../../src/application/ports/ai-context-refiner";
import type { BuildContextUseCase } from "../../src/application/use-cases/build-context.use-case";
import type { Logger } from "../../src/application/ports/logger";
import { RefineContextUseCase } from "../../src/application/use-cases/refine-context.use-case";
import type { BuiltContextPackage } from "../../src/core/context/context-types";
import { GraphMemoError } from "../../src/core/errors/graphmemo-error";
import type { AiRefinementConfig } from "../../src/shared/config/project-config";

function createLoggerStub(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
}

function createDeterministicContextFixture(): BuiltContextPackage {
  return {
    task: "corrigir calculo de comissao premium",
    extractedTerms: ["corrigir", "calculo", "comissao", "premium"],
    relevantFiles: ["src/domain/commission-policy.ts"],
    relevantSymbols: ["calculateCommission"],
    relevantModules: ["src/domain"],
    fileRelations: [],
    relevantKnowledgeNotes: ["knowledge/features/2026-04-10-ajuste-comissao-premium.md"],
    relevantAdrsAndDocs: ["docs/adr/ADR-001-arquitetura-base.md"],
    suggestedStartingPoints: ["Revisar calculateCommission em src/domain/commission-policy.ts"]
  };
}

function createRefinedOutputFixture(): RefinedContextOutput {
  return {
    summary: "A task foca no ajuste de calculo de comissao premium.",
    refinedTaskBrief:
      "Ajustar a regra de calculo premium mantendo compatibilidade com contratos atuais.",
    keyFiles: ["src/domain/commission-policy.ts"],
    keyRisks: ["Quebra de comportamento para tiers nao premium."],
    suggestedImplementationFocus: ["Cobrir regressao em politica de comissao."],
    suggestedStartingPoint: "Comece pelo metodo calculateCommission.",
    implementationPrompt:
      "Implemente ajuste no calculo premium, mantendo comportamento atual para os demais casos.",
    promptPackage: {
      objective: "Corrigir comissao premium sem regressao.",
      constraints: ["Nao alterar contratos publicos.", "Manter pipeline deterministico."],
      contextHighlights: ["Existe nota de feature sobre ajuste premium."],
      suggestedPrompt:
        "Use o contexto abaixo para implementar o ajuste premium com foco em testes de regressao."
    }
  };
}

function createAiConfig(overrides: Partial<AiRefinementConfig> = {}): AiRefinementConfig {
  return {
    enabled: false,
    apiKey: "",
    model: "claude-3-5-sonnet-latest",
    timeoutMs: 8000,
    ...overrides
  };
}

describe("RefineContextUseCase", () => {
  it("retorna contexto deterministico e refinamento quando Claude responde com sucesso", async () => {
    const deterministicContext = createDeterministicContextFixture();
    const buildContextUseCase = {
      execute: vi.fn(async () => ({
        kind: "context" as const,
        status: "success" as const,
        message: "ok",
        details: deterministicContext
      }))
    };
    const aiRefiner: AiContextRefinerPort = {
      refineContext: vi.fn(async () => createRefinedOutputFixture())
    };
    const useCase = new RefineContextUseCase(
      createLoggerStub(),
      buildContextUseCase as unknown as BuildContextUseCase,
      aiRefiner,
      createAiConfig({ enabled: true, apiKey: "secret" })
    );

    const result = await useCase.execute({
      targetPath: ".",
      task: "corrigir calculo de comissao premium",
      format: "markdown",
      caseSensitive: false,
      exactMatch: false
    });

    expect(buildContextUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ format: "json" })
    );
    expect(result.status).toBe("success");
    expect(result.details).toMatchObject({
      deterministicContext,
      refinement: {
        status: "success"
      }
    });
  });

  it("faz fallback quando refinamento esta desabilitado", async () => {
    const deterministicContext = createDeterministicContextFixture();
    const buildContextUseCase = {
      execute: vi.fn(async () => ({
        kind: "context" as const,
        status: "success" as const,
        message: "ok",
        details: deterministicContext
      }))
    };
    const aiRefiner: AiContextRefinerPort = {
      refineContext: vi.fn(async () => createRefinedOutputFixture())
    };
    const useCase = new RefineContextUseCase(
      createLoggerStub(),
      buildContextUseCase as unknown as BuildContextUseCase,
      aiRefiner,
      createAiConfig({ enabled: false })
    );

    const result = await useCase.execute({
      targetPath: ".",
      task: "task",
      format: "json",
      caseSensitive: false,
      exactMatch: false
    });

    expect(aiRefiner.refineContext).not.toHaveBeenCalled();
    expect(result.details).toMatchObject({
      deterministicContext,
      refinement: {
        status: "skipped",
        reasonCode: "AI_REFINEMENT_DISABLED"
      }
    });
  });

  it("faz fallback quando refinamento esta habilitado sem API key", async () => {
    const deterministicContext = createDeterministicContextFixture();
    const buildContextUseCase = {
      execute: vi.fn(async () => ({
        kind: "context" as const,
        status: "success" as const,
        message: "ok",
        details: deterministicContext
      }))
    };
    const aiRefiner: AiContextRefinerPort = {
      refineContext: vi.fn(async () => createRefinedOutputFixture())
    };
    const useCase = new RefineContextUseCase(
      createLoggerStub(),
      buildContextUseCase as unknown as BuildContextUseCase,
      aiRefiner,
      createAiConfig({ enabled: true, apiKey: "" })
    );

    const result = await useCase.execute({
      targetPath: ".",
      task: "task",
      format: "json",
      caseSensitive: false,
      exactMatch: false
    });

    expect(aiRefiner.refineContext).not.toHaveBeenCalled();
    expect(result.details).toMatchObject({
      deterministicContext,
      refinement: {
        status: "skipped",
        reasonCode: "AI_REFINEMENT_NOT_CONFIGURED"
      }
    });
  });

  it("faz fallback quando Claude falha sem quebrar resultado deterministico", async () => {
    const deterministicContext = createDeterministicContextFixture();
    const buildContextUseCase = {
      execute: vi.fn(async () => ({
        kind: "context" as const,
        status: "success" as const,
        message: "ok",
        details: deterministicContext
      }))
    };
    const aiRefiner: AiContextRefinerPort = {
      refineContext: vi.fn(async () => {
        throw new GraphMemoError("AI_REFINEMENT_FAILED", "falhou upstream");
      })
    };
    const logger = createLoggerStub();
    const useCase = new RefineContextUseCase(
      logger,
      buildContextUseCase as unknown as BuildContextUseCase,
      aiRefiner,
      createAiConfig({ enabled: true, apiKey: "secret" })
    );

    const result = await useCase.execute({
      targetPath: ".",
      task: "task",
      format: "json",
      caseSensitive: false,
      exactMatch: false
    });

    expect(result.details).toMatchObject({
      deterministicContext,
      refinement: {
        status: "failed",
        reasonCode: "AI_REFINEMENT_FAILED"
      }
    });
    expect(logger.warn).toHaveBeenCalledOnce();
  });
});
