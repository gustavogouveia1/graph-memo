import { describe, expect, it, vi } from "vitest";

import type { ChatImportReaderPort } from "../../src/application/ports/chat-import-reader";
import type { KnowledgeWriterPort } from "../../src/application/ports/knowledge-writer";
import type { Logger } from "../../src/application/ports/logger";
import { ImportChatsUseCase } from "../../src/application/use-cases/import-chats.use-case";
import type { ImportedChat } from "../../src/core/chat-import/imported-chat";

function createLoggerStub(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
}

function createImportedChats(): ImportedChat[] {
  return [
    {
      provider: "cursor",
      sourceFile: "exports/cursor.json",
      topic: "indexador local",
      messages: [
        { role: "user", content: "vamos indexar o projeto" },
        { role: "assistant", content: "ok, comece com .graphmemo/" }
      ]
    }
  ];
}

describe("ImportChatsUseCase", () => {
  it("executa importacao com dry-run sem persistir arquivos", async () => {
    const reader: ChatImportReaderPort = {
      read: vi.fn(async () => ({
        chats: createImportedChats(),
        scannedFilesCount: 1,
        parsedFilesCount: 1,
        fallbackFilesCount: 0
      }))
    };
    const writer: KnowledgeWriterPort = {
      writeChatNotes: vi.fn(async () => [{ relativePath: "imports/nota.md" }])
    };
    const useCase = new ImportChatsUseCase(
      createLoggerStub(),
      reader,
      writer,
      "knowledge",
      "/tmp/project"
    );

    const result = await useCase.execute({
      source: "./exports/cursor.json",
      provider: "cursor",
      dryRun: true
    });

    expect(result.kind).toBe("import-chats");
    expect(result.status).toBe("success");
    expect(result.message).toContain("sem persistencia");
    expect(result.details).toMatchObject({
      scannedFilesCount: 1,
      parsedFilesCount: 1,
      importedChatsCount: 1,
      generatedNotesCount: 1,
      persistedNotesCount: 0,
      dryRun: true
    });
    expect(writer.writeChatNotes).not.toHaveBeenCalled();
  });

  it("persiste notas quando dry-run e falso", async () => {
    const reader: ChatImportReaderPort = {
      read: vi.fn(async () => ({
        chats: createImportedChats(),
        scannedFilesCount: 1,
        parsedFilesCount: 1,
        fallbackFilesCount: 0
      }))
    };
    const writer: KnowledgeWriterPort = {
      writeChatNotes: vi.fn(async () => [{ relativePath: "imports/nota.md" }])
    };
    const useCase = new ImportChatsUseCase(
      createLoggerStub(),
      reader,
      writer,
      "knowledge",
      "/tmp/project"
    );

    const result = await useCase.execute({
      source: "./exports/cursor.json",
      provider: "cursor",
      dryRun: false
    });

    expect(result.status).toBe("success");
    expect(result.message).toContain("persistida");
    expect(writer.writeChatNotes).toHaveBeenCalledOnce();
  });
});
