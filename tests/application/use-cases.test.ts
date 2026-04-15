import { describe, expect, it, vi } from "vitest";

import { BuildContextUseCase } from "../../src/application/use-cases/build-context.use-case";
import { ImportChatsUseCase } from "../../src/application/use-cases/import-chats.use-case";
import { RunIndexUseCase } from "../../src/application/use-cases/run-index.use-case";
import type { Logger } from "../../src/application/ports/logger";

function createLoggerStub(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
}

describe("Application use cases stubs", () => {
  it("retorna status stub para index", async () => {
    const useCase = new RunIndexUseCase(createLoggerStub());
    const result = await useCase.execute({
      targetPath: ".",
      fullReindex: false,
      dryRun: true
    });

    expect(result).toEqual({
      kind: "index",
      status: "stub",
      message: "Comando index pronto para receber pipeline real de indexacao."
    });
  });

  it("retorna status stub para context", async () => {
    const useCase = new BuildContextUseCase(createLoggerStub());
    const result = await useCase.execute({
      taskId: "TASK-1",
      format: "markdown"
    });

    expect(result).toEqual({
      kind: "context",
      status: "stub",
      message: "Comando context pronto para receber context builder real."
    });
  });

  it("retorna status stub para import-chats", async () => {
    const useCase = new ImportChatsUseCase(createLoggerStub());
    const result = await useCase.execute({
      source: "./chats",
      provider: "generic",
      dryRun: true
    });

    expect(result).toEqual({
      kind: "import-chats",
      status: "stub",
      message: "Comando import-chats pronto para receber pipeline de importacao."
    });
  });
});
