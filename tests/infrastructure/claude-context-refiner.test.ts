import { afterEach, describe, expect, it, vi } from "vitest";

import { ClaudeContextRefiner } from "../../src/infrastructure/ai/claude-context-refiner";

const deterministicContextFixture = {
  task: "corrigir calculo de comissao premium",
  extractedTerms: ["corrigir", "comissao", "premium"],
  relevantFiles: ["src/domain/commission-policy.ts"],
  relevantSymbols: ["calculateCommission"],
  relevantModules: ["src/domain"],
  fileRelations: [],
  relevantKnowledgeNotes: ["knowledge/features/2026-04-10-ajuste-comissao-premium.md"],
  relevantAdrsAndDocs: ["docs/adr/ADR-001-arquitetura-base.md"],
  suggestedStartingPoints: ["Revisar calculateCommission"]
};

describe("ClaudeContextRefiner", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parseia payload valido retornado por Claude", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          content: [
            {
              type: "text",
              text: JSON.stringify({
                summary: "Resumo",
                refinedTaskBrief: "Brief",
                keyFiles: ["src/domain/commission-policy.ts"],
                keyRisks: ["risco"],
                suggestedImplementationFocus: ["foco"],
                suggestedStartingPoint: "inicio",
                implementationPrompt: "prompt",
                promptPackage: {
                  objective: "objetivo",
                  constraints: ["restricao"],
                  contextHighlights: ["destaque"],
                  suggestedPrompt: "prompt sugerido"
                }
              })
            }
          ]
        })
      }))
    );

    const adapter = new ClaudeContextRefiner({
      enabled: true,
      apiKey: "secret",
      model: "claude-3-5-sonnet-latest",
      timeoutMs: 8000
    });

    const result = await adapter.refineContext({
      task: "corrigir calculo de comissao premium",
      deterministicContext: deterministicContextFixture
    });

    expect(result).toMatchObject({
      summary: "Resumo",
      keyFiles: ["src/domain/commission-policy.ts"]
    });
  });

  it("retorna erro tipado quando Claude responde payload invalido", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          content: [{ type: "text", text: "{\"summary\":\"incompleto\"}" }]
        })
      }))
    );

    const adapter = new ClaudeContextRefiner({
      enabled: true,
      apiKey: "secret",
      model: "claude-3-5-sonnet-latest",
      timeoutMs: 8000
    });

    await expect(
      adapter.refineContext({
        task: "task",
        deterministicContext: deterministicContextFixture
      })
    ).rejects.toMatchObject({
      code: "AI_REFINEMENT_INVALID_RESPONSE"
    });
  });
});
