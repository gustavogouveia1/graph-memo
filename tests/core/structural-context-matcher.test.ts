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

function createFrontendRelevanceFixture(): IndexedFile[] {
  return [
    {
      relativePath: "frontend/src/pages/financeiro/RelatorioComissoes.tsx",
      extension: ".tsx",
      size: 420,
      mtimeMs: 1710000000020,
      hash: "hash-relatorio",
      imports: [
        {
          source: "@/services/financeiro/comissoes-service",
          isTypeOnly: false,
          name: "ComissoesService",
          kind: "value"
        },
        {
          source: "@/components/financeiro/FiltrosPeriodoStatus",
          isTypeOnly: false,
          name: "FiltrosPeriodoStatus",
          kind: "value"
        },
        {
          source: "@/components/financeiro/ExportacaoCsvButton",
          isTypeOnly: false,
          name: "ExportacaoCsvButton",
          kind: "value"
        }
      ],
      exports: [{ name: "RelatorioComissoes", kind: "function", isDefault: true }],
      symbols: [{ name: "RelatorioComissoes", kind: "function" }]
    },
    {
      relativePath: "frontend/src/services/financeiro/comissoes-service.ts",
      extension: ".ts",
      size: 190,
      mtimeMs: 1710000000030,
      hash: "hash-service",
      imports: [{ source: "@/shared/http/client", isTypeOnly: false, name: "httpClient", kind: "value" }],
      exports: [{ name: "ComissoesService", kind: "class", isDefault: false }],
      symbols: [{ name: "ComissoesService", kind: "class" }]
    },
    {
      relativePath: "frontend/src/components/financeiro/FiltrosPeriodoStatus.tsx",
      extension: ".tsx",
      size: 180,
      mtimeMs: 1710000000040,
      hash: "hash-filtro",
      imports: [],
      exports: [{ name: "FiltrosPeriodoStatus", kind: "function", isDefault: true }],
      symbols: [{ name: "FiltrosPeriodoStatus", kind: "function" }]
    },
    {
      relativePath: "frontend/src/components/financeiro/ExportacaoCsvButton.tsx",
      extension: ".tsx",
      size: 160,
      mtimeMs: 1710000000050,
      hash: "hash-export",
      imports: [],
      exports: [{ name: "ExportacaoCsvButton", kind: "function", isDefault: true }],
      symbols: [{ name: "ExportacaoCsvButton", kind: "function" }]
    },
    {
      relativePath: "frontend/src/App.tsx",
      extension: ".tsx",
      size: 220,
      mtimeMs: 1710000000060,
      hash: "hash-app",
      imports: [],
      exports: [{ name: "App", kind: "function", isDefault: true }],
      symbols: [{ name: "App", kind: "function" }]
    },
    {
      relativePath: "frontend/src/pages/Dashboard.tsx",
      extension: ".tsx",
      size: 220,
      mtimeMs: 1710000000070,
      hash: "hash-dashboard",
      imports: [],
      exports: [{ name: "Dashboard", kind: "function", isDefault: true }],
      symbols: [{ name: "Dashboard", kind: "function" }]
    },
    {
      relativePath: "frontend/src/pages/clientes/ClientesList.tsx",
      extension: ".tsx",
      size: 220,
      mtimeMs: 1710000000080,
      hash: "hash-clientes",
      imports: [],
      exports: [{ name: "ClientesList", kind: "function", isDefault: true }],
      symbols: [{ name: "ClientesList", kind: "function" }]
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

  it("prioriza pagina alvo e reduz ruido de arquivos genericos", () => {
    const files = createFrontendRelevanceFixture();
    const queryLayer = new LocalIndexQueryLayer(files);
    const filters: ContextBuildFilters = {
      file: "frontend/src/pages/financeiro/RelatorioComissoes.tsx"
    };

    const result = buildStructuralContext({
      task: "Implementar filtro avancado e exportacao no relatorio de comissoes",
      terms: [
        "implementar",
        "filtro",
        "avancado",
        "exportacao",
        "relatorio",
        "comissoes",
        "csv",
        "exp",
        "fil",
        "per"
      ],
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

    expect(result.relevantFiles[0]).toBe("frontend/src/pages/financeiro/RelatorioComissoes.tsx");
    expect(result.relevantFiles).toEqual(
      expect.arrayContaining([
        "frontend/src/services/financeiro/comissoes-service.ts",
        "frontend/src/components/financeiro/FiltrosPeriodoStatus.tsx",
        "frontend/src/components/financeiro/ExportacaoCsvButton.tsx"
      ])
    );
    expect(result.relevantFiles).not.toContain("frontend/src/App.tsx");
    expect(result.relevantFiles).not.toContain("frontend/src/pages/Dashboard.tsx");
    expect(result.relevantFiles).not.toContain("frontend/src/pages/clientes/ClientesList.tsx");

    const relatorioRelations = result.fileRelations.find(
      (relation) => relation.filePath === "frontend/src/pages/financeiro/RelatorioComissoes.tsx"
    );
    expect(relatorioRelations).toBeDefined();
    expect(relatorioRelations?.dependsOn).toEqual(
      expect.arrayContaining([
        "frontend/src/services/financeiro/comissoes-service.ts",
        "frontend/src/components/financeiro/FiltrosPeriodoStatus.tsx",
        "frontend/src/components/financeiro/ExportacaoCsvButton.tsx"
      ])
    );
  });
});
