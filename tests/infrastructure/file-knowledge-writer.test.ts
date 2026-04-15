import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import type { NormalizedChatNote } from "../../src/core/chat-import/normalized-chat-note";
import { FileKnowledgeWriter } from "../../src/infrastructure/knowledge/file-knowledge-writer";

const tempDirectories: string[] = [];

async function createTempDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "graphmemo-knowledge-writer-"));
  tempDirectories.push(directory);
  return directory;
}

describe("FileKnowledgeWriter", () => {
  afterEach(async () => {
    await Promise.all(
      tempDirectories.map(async (directory) => {
        await rm(directory, { recursive: true, force: true });
      })
    );
    tempDirectories.length = 0;
  });

  it("grava notas normalizadas em knowledge/imports", async () => {
    const knowledgeRoot = await createTempDirectory();
    const writer = new FileKnowledgeWriter();
    const notes: NormalizedChatNote[] = [
      {
        title: "Chat Import - 2026-04-15 - cursor - indexador local",
        topic: "indexador local",
        provider: "cursor",
        sourceFile: "exports/cursor.json",
        importedAt: "2026-04-15T12:00:00.000Z",
        tags: ["#import", "#provider/cursor"],
        related: ["[[ADR-001]]"],
        messages: [{ role: "user", content: "Mensagem 1" }],
        noteFileName: "2026-04-15-indexador-local-cursor.md",
        noteContent: "# Nota\n\nconteudo"
      }
    ];

    const result = await writer.writeChatNotes(knowledgeRoot, notes);

    expect(result).toEqual([{ relativePath: "imports/2026-04-15-indexador-local-cursor.md" }]);

    const stored = await readFile(
      join(knowledgeRoot, "imports", "2026-04-15-indexador-local-cursor.md"),
      "utf8"
    );
    expect(stored).toBe("# Nota\n\nconteudo");
  });
});
