import { describe, expect, it } from "vitest";

import { buildKnowledgeContext } from "../../src/core/context/knowledge-context-matcher";
import type {
  ContextKnowledgeDocument,
  StructuralContextResult
} from "../../src/core/context/context-types";

describe("buildKnowledgeContext", () => {
  it("prioriza notes e ADRs/docs por score deterministico", () => {
    const structuralContext: StructuralContextResult = {
      task: "corrigir calculo de comissao",
      extractedTerms: ["corrigir", "calculo", "comissao"],
      relevantFiles: ["src/core/finance/calculate-commission.ts"],
      relevantSymbols: ["calculateCommission"],
      relevantModules: ["../../core/finance/calculate-commission"],
      fileRelations: []
    };
    const documents: ContextKnowledgeDocument[] = [
      {
        relativePath: "knowledge/features/2026-04-15-comissao-v1.md",
        title: "Feature: Calculo de comissao",
        content: "ajuste da regra calculateCommission",
        category: "knowledge-note"
      },
      {
        relativePath: "knowledge/imports/2026-04-15-chat-comissao.md",
        title: "Chat import comissao",
        content: "discussao sobre modulo financeiro",
        category: "knowledge-import"
      },
      {
        relativePath: "docs/adr/ADR-001-arquitetura-base.md",
        title: "ADR-001",
        content: "camadas de aplicacao",
        category: "adr"
      },
      {
        relativePath: "docs/engineering/testing-rules.md",
        title: "Regras de Testes",
        content: "testes deterministas",
        category: "engineering-doc"
      }
    ];

    const result = buildKnowledgeContext({
      documents,
      structuralContext,
      maxKnowledgeNotes: 5,
      maxAdrsAndDocs: 5
    });

    expect(result.relevantKnowledgeNotes).toEqual(
      expect.arrayContaining([
        "knowledge/features/2026-04-15-comissao-v1.md",
        "knowledge/imports/2026-04-15-chat-comissao.md"
      ])
    );
    expect(result.relevantAdrsAndDocs).toEqual(
      expect.arrayContaining(["docs/adr/ADR-001-arquitetura-base.md"])
    );
  });
});
