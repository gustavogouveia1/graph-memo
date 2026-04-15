import { describe, expect, it, vi } from "vitest";

import type { IndexQueryReaderPort } from "../../src/application/ports/index-query-reader";
import type { KnowledgeContextReaderPort } from "../../src/application/ports/knowledge-context-reader";
import type { Logger } from "../../src/application/ports/logger";
import type { StoredIndex } from "../../src/application/ports/index-store";
import { BuildContextUseCase } from "../../src/application/use-cases/build-context.use-case";
import type { ContextKnowledgeDocument } from "../../src/core/context/context-types";
import type { IndexedFile } from "../../src/core/indexing/indexed-file";

function createLoggerStub(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
}

function createStoredIndexFixture(): StoredIndex {
  const files: IndexedFile[] = [
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
      mtimeMs: 1710000000010,
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

  return {
    manifest: {
      schemaVersion: "1",
      generatedAt: "2026-04-15T00:00:00.000Z",
      rootPath: "/tmp/project",
      indexedFilesCount: 2,
      supportedExtensions: [".ts"]
    },
    files
  };
}

function createKnowledgeDocumentsFixture(): ContextKnowledgeDocument[] {
  return [
    {
      relativePath: "knowledge/features/2026-04-15-comissao-v1.md",
      title: "Feature: Regra de comissao v1",
      content: "calculo de comissao e fluxo de pagamento",
      category: "knowledge-note"
    },
    {
      relativePath: "knowledge/imports/2026-04-15-comissao-chat.md",
      title: "Chat Import - comissao",
      content: "ajustar calculateCommission",
      category: "knowledge-import"
    },
    {
      relativePath: "docs/adr/ADR-001-arquitetura-base.md",
      title: "ADR-001: Arquitetura Base",
      content: "camadas e fronteiras",
      category: "adr"
    }
  ];
}

describe("BuildContextUseCase", () => {
  it("gera contexto consolidado em markdown", async () => {
    const indexReader: IndexQueryReaderPort = {
      read: vi.fn(async () => createStoredIndexFixture())
    };
    const knowledgeReader: KnowledgeContextReaderPort = {
      readDocuments: vi.fn(async () => createKnowledgeDocumentsFixture())
    };
    const useCase = new BuildContextUseCase(createLoggerStub(), indexReader, knowledgeReader);

    const result = await useCase.execute({
      targetPath: "/tmp/project",
      task: "corrigir calculo de comissao",
      format: "markdown",
      caseSensitive: false,
      exactMatch: false
    });

    expect(result.kind).toBe("context");
    expect(result.status).toBe("success");
    expect(typeof result.details).toBe("string");
    expect(result.details).toContain("Relevant Files");
    expect(result.details).toContain("src/core/finance/calculate-commission.ts");
    expect(knowledgeReader.readDocuments).toHaveBeenCalledOnce();
  });

  it("gera contexto consolidado em json com campos previsiveis", async () => {
    const indexReader: IndexQueryReaderPort = {
      read: vi.fn(async () => createStoredIndexFixture())
    };
    const knowledgeReader: KnowledgeContextReaderPort = {
      readDocuments: vi.fn(async () => createKnowledgeDocumentsFixture())
    };
    const useCase = new BuildContextUseCase(createLoggerStub(), indexReader, knowledgeReader);

    const result = await useCase.execute({
      targetPath: "/tmp/project",
      task: "corrigir calculo de comissao",
      format: "json",
      caseSensitive: false,
      exactMatch: false,
      symbol: "calculateCommission"
    });

    expect(result.status).toBe("success");
    expect(result.details).toMatchObject({
      task: "corrigir calculo de comissao",
      relevantFiles: expect.arrayContaining(["src/core/finance/calculate-commission.ts"]),
      relevantSymbols: expect.arrayContaining(["calculateCommission"]),
      relevantKnowledgeNotes: expect.arrayContaining(["knowledge/features/2026-04-15-comissao-v1.md"]),
      relevantAdrsAndDocs: expect.arrayContaining(["docs/adr/ADR-001-arquitetura-base.md"])
    });
  });

  it("falha quando task textual e vazia", async () => {
    const indexReader: IndexQueryReaderPort = {
      read: vi.fn(async () => createStoredIndexFixture())
    };
    const knowledgeReader: KnowledgeContextReaderPort = {
      readDocuments: vi.fn(async () => createKnowledgeDocumentsFixture())
    };
    const useCase = new BuildContextUseCase(createLoggerStub(), indexReader, knowledgeReader);

    await expect(
      useCase.execute({
        targetPath: "/tmp/project",
        task: "   ",
        format: "markdown",
        caseSensitive: false,
        exactMatch: false
      })
    ).rejects.toEqual(
      expect.objectContaining({
        code: "CONTEXT_INVALID_INPUT"
      })
    );
  });
});
