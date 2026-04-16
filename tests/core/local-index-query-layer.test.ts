import { describe, expect, it } from "vitest";

import type { IndexedFile } from "../../src/core/indexing/indexed-file";
import { LocalIndexQueryLayer } from "../../src/core/query/local-index-query-layer";

function createIndexedFilesFixture(): IndexedFile[] {
  return [
    {
      relativePath: "src/core/math.ts",
      extension: ".ts",
      size: 120,
      mtimeMs: 1710000000000,
      hash: "hash-1",
      imports: [],
      exports: [{ name: "sum", kind: "function", isDefault: false }],
      symbols: [{ name: "sum", kind: "function" }]
    },
    {
      relativePath: "src/services/calc.ts",
      extension: ".ts",
      size: 220,
      mtimeMs: 1710000000001,
      hash: "hash-2",
      imports: [{ source: "../core/math", isTypeOnly: false, name: "sum", kind: "value" }],
      exports: [{ name: "CalcService", kind: "class", isDefault: false }],
      symbols: [{ name: "CalcService", kind: "class" }]
    },
    {
      relativePath: "src/index.ts",
      extension: ".ts",
      size: 80,
      mtimeMs: 1710000000002,
      hash: "hash-3",
      imports: [{ source: "./services/calc", isTypeOnly: false, name: "CalcService", kind: "value" }],
      exports: [{ name: "CalcService", kind: "value", exportedAs: "CalcService" }],
      symbols: []
    }
  ];
}

function createAliasFixture(): IndexedFile[] {
  return [
    {
      relativePath: "frontend/src/pages/financeiro/RelatorioComissoes.tsx",
      extension: ".tsx",
      size: 180,
      mtimeMs: 1710000000100,
      hash: "alias-1",
      imports: [
        {
          source: "@/services/financeiro/comissoes-service",
          isTypeOnly: false,
          name: "ComissoesService",
          kind: "value"
        },
        {
          source: "~/components/financeiro/FiltrosPeriodoStatus",
          isTypeOnly: false,
          name: "FiltrosPeriodoStatus",
          kind: "value"
        }
      ],
      exports: [{ name: "RelatorioComissoes", kind: "function", isDefault: true }],
      symbols: [{ name: "RelatorioComissoes", kind: "function" }]
    },
    {
      relativePath: "frontend/src/services/financeiro/comissoes-service.ts",
      extension: ".ts",
      size: 120,
      mtimeMs: 1710000000101,
      hash: "alias-2",
      imports: [],
      exports: [{ name: "ComissoesService", kind: "class", isDefault: false }],
      symbols: [{ name: "ComissoesService", kind: "class" }]
    },
    {
      relativePath: "frontend/src/components/financeiro/FiltrosPeriodoStatus/index.tsx",
      extension: ".tsx",
      size: 120,
      mtimeMs: 1710000000102,
      hash: "alias-3",
      imports: [],
      exports: [{ name: "FiltrosPeriodoStatus", kind: "function", isDefault: true }],
      symbols: [{ name: "FiltrosPeriodoStatus", kind: "function" }]
    }
  ];
}

describe("LocalIndexQueryLayer", () => {
  it("consulta simbolos definidos, exports e imports", () => {
    const queryLayer = new LocalIndexQueryLayer(createIndexedFilesFixture());

    expect(queryLayer.findFilesBySymbol("CalcService")).toEqual(["src/services/calc.ts"]);
    expect(queryLayer.findExportsBySymbol("CalcService")).toEqual([
      {
        filePath: "src/index.ts",
        exportEntry: { name: "CalcService", kind: "value", exportedAs: "CalcService" }
      },
      {
        filePath: "src/services/calc.ts",
        exportEntry: { name: "CalcService", kind: "class", isDefault: false }
      }
    ]);
    expect(queryLayer.findFilesImportingModule("../core/math")).toEqual(["src/services/calc.ts"]);
    expect(queryLayer.listIndexedFiles()).toEqual([
      "src/core/math.ts",
      "src/index.ts",
      "src/services/calc.ts"
    ]);
  });

  it("suporta combinacao de case-insensitive com busca parcial", () => {
    const queryLayer = new LocalIndexQueryLayer(createIndexedFilesFixture());

    expect(
      queryLayer.findFilesBySymbol("calc", {
        caseSensitive: false,
        exactMatch: false
      })
    ).toEqual(["src/services/calc.ts"]);
  });

  it("retorna detalhes e relacoes basicas por arquivo", () => {
    const queryLayer = new LocalIndexQueryLayer(createIndexedFilesFixture());

    expect(queryLayer.getFileDetails("src/services/calc.ts")).toEqual({
      relativePath: "src/services/calc.ts",
      symbols: [{ name: "CalcService", kind: "class" }],
      imports: [{ source: "../core/math", isTypeOnly: false, name: "sum", kind: "value" }],
      exports: [{ name: "CalcService", kind: "class", isDefault: false }]
    });
    expect(queryLayer.findFilesRelatedByImportExport("src/core/math.ts")).toEqual({
      relativePath: "src/core/math.ts",
      dependsOn: [],
      importedBy: ["src/services/calc.ts"]
    });
    expect(queryLayer.findFilesRelatedByImportExport("src/services/calc.ts")).toEqual({
      relativePath: "src/services/calc.ts",
      dependsOn: ["src/core/math.ts"],
      importedBy: ["src/index.ts"]
    });
    expect(queryLayer.getRelations()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "file_defines_symbol", filePath: "src/core/math.ts" }),
        expect.objectContaining({ type: "file_imports_module", filePath: "src/services/calc.ts" }),
        expect.objectContaining({ type: "file_exports_symbol", filePath: "src/services/calc.ts" })
      ])
    );
  });

  it("resolve relacoes com aliases comuns e index files", () => {
    const queryLayer = new LocalIndexQueryLayer(createAliasFixture());

    expect(
      queryLayer.findFilesRelatedByImportExport("frontend/src/pages/financeiro/RelatorioComissoes.tsx")
    ).toEqual({
      relativePath: "frontend/src/pages/financeiro/RelatorioComissoes.tsx",
      dependsOn: [
        "frontend/src/components/financeiro/FiltrosPeriodoStatus/index.tsx",
        "frontend/src/services/financeiro/comissoes-service.ts"
      ],
      importedBy: []
    });
  });
});
