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
