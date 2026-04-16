import { describe, expect, it, vi } from "vitest";

import type { FileSystemPort } from "../../src/application/ports/file-system";
import type { IndexStorePort, StoredIndex } from "../../src/application/ports/index-store";
import { RunIndexUseCase } from "../../src/application/use-cases/run-index.use-case";
import type { Logger } from "../../src/application/ports/logger";
import type {
  ParsedSourceCode,
  SourceCodeParserPort
} from "../../src/application/ports/source-code-parser";

function createLoggerStub(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
}

describe("Application use cases", () => {
  it("executa indexacao em modo dry-run com resumo consistente", async () => {
    const fileSystem: FileSystemPort = {
      listFilesRecursively: vi.fn(async () => [
        "/tmp/project/src/foo.ts",
        "/tmp/project/README.md"
      ]),
      readTextFile: vi.fn(),
      readFileBuffer: vi.fn(async () => Buffer.from("export function runIndex() {}", "utf8")),
      getFileMetadata: vi.fn(async () => ({
        size: 29,
        mtimeMs: 1710000000000
      }))
    };
    const parserResult: ParsedSourceCode = {
      imports: [],
      exports: [{ name: "runIndex", kind: "function", isDefault: false }],
      symbols: [{ name: "runIndex", kind: "function" }]
    };
    const parser: SourceCodeParserPort = {
      parse: vi.fn(() => parserResult)
    };
    const indexStore: IndexStorePort = {
      load: vi.fn(async (): Promise<StoredIndex | null> => null),
      save: vi.fn(async () => undefined)
    };
    const useCase = new RunIndexUseCase(createLoggerStub(), fileSystem, parser, indexStore);

    const result = await useCase.execute({
      targetPath: "/tmp/project",
      fullReindex: false,
      dryRun: true
    });

    expect(result.kind).toBe("index");
    expect(result.status).toBe("success");
    expect(result.message).toContain("Indexacao incremental concluida");
    expect(result.details).toMatchObject({
      indexedFilesCount: 1,
      parsedFilesCount: 1,
      reusedFilesCount: 0,
      dryRun: true
    });
    expect(indexStore.save).not.toHaveBeenCalled();
  });
});
