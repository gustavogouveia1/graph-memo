import { describe, expect, it, vi } from "vitest";

import type { IndexQueryReaderPort } from "../../src/application/ports/index-query-reader";
import type { Logger } from "../../src/application/ports/logger";
import type { StoredIndex } from "../../src/application/ports/index-store";
import { QueryIndexUseCase } from "../../src/application/use-cases/query-index.use-case";
import { GraphMemoError } from "../../src/core/errors/graphmemo-error";
import type { IndexedFile } from "../../src/core/indexing/indexed-file";

function createLoggerStub(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
}

function createQueryReaderStub(): IndexQueryReaderPort {
  const files: IndexedFile[] = [
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
      relativePath: "src/index.ts",
      extension: ".ts",
      size: 80,
      mtimeMs: 1710000000002,
      hash: "hash-2",
      imports: [{ source: "./core/math", isTypeOnly: false, name: "sum", kind: "value" }],
      exports: [{ name: "sum", kind: "value", exportedAs: "sum" }],
      symbols: []
    }
  ];
  const storedIndex: StoredIndex = {
    manifest: {
      schemaVersion: "1",
      generatedAt: "2026-04-15T00:00:00.000Z",
      rootPath: "/tmp/project",
      indexedFilesCount: 2,
      supportedExtensions: [".ts"]
    },
    files
  };

  return {
    read: vi.fn(async () => storedIndex)
  };
}

describe("QueryIndexUseCase", () => {
  it("retorna detalhes agregados para filtros de simbolo e listagem", async () => {
    const useCase = new QueryIndexUseCase(createLoggerStub(), createQueryReaderStub());

    const result = await useCase.execute({
      targetPath: "/tmp/project",
      symbol: "sum",
      listFiles: true,
      caseSensitive: true,
      exactMatch: true
    });

    expect(result.kind).toBe("query");
    expect(result.status).toBe("success");
    expect(result.details).toMatchObject({
      indexedFilesCount: 2,
      filesBySymbol: ["src/core/math.ts"],
      indexedFiles: ["src/core/math.ts", "src/index.ts"],
      exportsBySymbol: expect.arrayContaining([
        expect.objectContaining({ filePath: "src/index.ts", exportName: "sum" }),
        expect.objectContaining({ filePath: "src/core/math.ts", exportName: "sum" })
      ])
    });
  });

  it("falha quando nenhum filtro e informado", async () => {
    const useCase = new QueryIndexUseCase(createLoggerStub(), createQueryReaderStub());

    await expect(
      useCase.execute({
        targetPath: "/tmp/project",
        listFiles: false,
        caseSensitive: true,
        exactMatch: true
      })
    ).rejects.toEqual(
      expect.objectContaining({
        code: "QUERY_INVALID_INPUT"
      })
    );
  });

  it("propaga erro tipado do reader", async () => {
    const reader: IndexQueryReaderPort = {
      read: vi.fn(async () => {
        throw new GraphMemoError("INDEX_NOT_FOUND", "indice ausente");
      })
    };
    const useCase = new QueryIndexUseCase(createLoggerStub(), reader);

    await expect(
      useCase.execute({
        targetPath: "/tmp/project",
        symbol: "sum",
        listFiles: false,
        caseSensitive: true,
        exactMatch: true
      })
    ).rejects.toEqual(
      expect.objectContaining({
        code: "INDEX_NOT_FOUND"
      })
    );
  });
});
