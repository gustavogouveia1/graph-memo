import { describe, expect, it } from "vitest";

import { buildStructuralContext } from "../../src/core/context/structural-context-matcher";
import type { ContextBuildFilters } from "../../src/core/context/context-types";
import type { IndexedFile } from "../../src/core/indexing/indexed-file";
import { LocalIndexQueryLayer } from "../../src/core/query/local-index-query-layer";

function createIndexedFilesFixture(): IndexedFile[] {
  return [
    {
      relativePath: "src/core/finance/calculate-commission.ts",
      extension: ".ts",
      size: 100,
      mtimeMs: 1710000000000,
      hash: "hash-1",
      imports: [],
      exports: [{ name: "calculateCommission", kind: "function", isDefault: false }],
      symbols: [{ name: "calculateCommission", kind: "function" }]
    },
    {
      relativePath: "src/application/use-cases/process-commission.use-case.ts",
      extension: ".ts",
      size: 120,
      mtimeMs: 1710000000001,
      hash: "hash-2",
      imports: [
        {
          source: "../../core/finance/calculate-commission",
          isTypeOnly: false,
          name: "calculateCommission",
          kind: "value"
        }
      ],
      exports: [{ name: "ProcessCommissionUseCase", kind: "class", isDefault: false }],
      symbols: [{ name: "ProcessCommissionUseCase", kind: "class" }]
    }
  ];
}

describe("buildStructuralContext", () => {
  it("retorna arquivos, simbolos, modulos e relacoes relevantes", () => {
    const files = createIndexedFilesFixture();
    const queryLayer = new LocalIndexQueryLayer(files);
    const filters: ContextBuildFilters = {
      symbol: "calculateCommission"
    };

    const result = buildStructuralContext({
      task: "corrigir calculo de comissao",
      terms: ["corrigir", "calculo", "comissao", "com"],
      filters,
      files,
      queryLayer,
      matchOptions: {
        caseSensitive: false,
        exactMatch: false
      },
      maxFiles: 10,
      maxSymbols: 10,
      maxModules: 10,
      maxRelations: 5
    });

    expect(result.relevantFiles).toEqual(
      expect.arrayContaining([
        "src/core/finance/calculate-commission.ts",
        "src/application/use-cases/process-commission.use-case.ts"
      ])
    );
    expect(result.relevantSymbols).toContain("calculateCommission");
    expect(result.relevantModules).toContain("../../core/finance/calculate-commission");
    expect(result.fileRelations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          filePath: "src/core/finance/calculate-commission.ts",
          importedBy: expect.arrayContaining(["src/application/use-cases/process-commission.use-case.ts"])
        })
      ])
    );
  });
});
