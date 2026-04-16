import { describe, expect, it } from "vitest";

import { extractTaskTerms } from "../../src/core/context/task-term-extractor";

describe("extractTaskTerms", () => {
  it("extrai termos deterministas removendo ruido basico", () => {
    const terms = extractTaskTerms("Corrigir calculo de comissao no modulo financeiro", []);

    expect(terms).toEqual(
      expect.arrayContaining(["corrigir", "calculo", "comissao", "modulo", "financeiro"])
    );
    expect(terms).not.toContain("de");
    expect(terms).not.toContain("no");
  });

  it("remove tokens curtos fracos e nao cria abreviacoes automaticas", () => {
    const terms = extractTaskTerms("exportar CSV com filtros por periodo e status", []);

    expect(terms).toEqual(
      expect.arrayContaining(["exportar", "filtros", "periodo", "status", "csv"])
    );
    expect(terms).not.toEqual(expect.arrayContaining(["exp", "fil", "per", "rel", "com", "imp"]));
  });

  it("normaliza acentuacao, deduplica e preserva extras fortes", () => {
    const terms = extractTaskTerms("Relatório de Comissões e relatorio de comissoes", [
      "frontend/src/pages/financeiro/RelatorioComissoes.tsx",
      "calculateCommission"
    ]);

    expect(terms).toEqual(
      expect.arrayContaining([
        "relatorio",
        "comissoes",
        "frontend/src/pages/financeiro/relatoriocomissoes.tsx",
        "calculatecommission"
      ])
    );
    expect(terms.filter((term) => term === "relatorio")).toHaveLength(1);
  });

  it("inclui termos extras como arquivo e simbolo", () => {
    const terms = extractTaskTerms("ajustar comissao", [
      "calculateCommission",
      "src/core/finance/calculate-commission.ts"
    ]);

    expect(terms).toEqual(
      expect.arrayContaining([
        "ajustar",
        "comissao",
        "calculatecommission",
        "src/core/finance/calculate-commission.ts"
      ])
    );
  });
});
