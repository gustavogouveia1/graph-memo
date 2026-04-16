import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import type { GraphMemoError } from "../../src/core/errors/graphmemo-error";
import { FileChatImportReader } from "../../src/infrastructure/ingestion/file-chat-import-reader";

const tempDirectories: string[] = [];

async function createTempDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "graphmemo-chat-import-"));
  tempDirectories.push(directory);
  return directory;
}

describe("FileChatImportReader", () => {
  afterEach(async () => {
    await Promise.all(
      tempDirectories.map(async (directory) => {
        await rm(directory, { recursive: true, force: true });
      })
    );
    tempDirectories.length = 0;
  });

  it("usa parser dedicado de chatgpt e fallback generic quando necessario", async () => {
    const root = await createTempDirectory();
    const exportsDir = join(root, "exports");
    await mkdir(exportsDir, { recursive: true });

    await writeFile(
      join(exportsDir, "chatgpt.json"),
      JSON.stringify([
        {
          title: "Plano do indexador",
          mapping: {
            "1": {
              create_time: 1710000000,
              message: {
                author: { role: "user" },
                content: { parts: ["Como modelar o indexador?"] }
              }
            },
            "2": {
              create_time: 1710000020,
              message: {
                author: { role: "assistant" },
                content: { parts: ["Mantenha parser e store separados."] }
              }
            }
          }
        }
      ]),
      "utf8"
    );

    await writeFile(
      join(exportsDir, "fallback.txt"),
      "User: Quais formatos suportar?\nAssistant: .json, .jsonl, .txt e .md",
      "utf8"
    );

    const reader = new FileChatImportReader();
    const result = await reader.read({
      sourcePath: exportsDir,
      provider: "chatgpt"
    });

    expect(result.scannedFilesCount).toBe(2);
    expect(result.parsedFilesCount).toBe(2);
    expect(result.fallbackFilesCount).toBe(1);
    expect(result.chats).toHaveLength(2);
    expect(result.chats[0]?.provider).toBe("chatgpt");
    expect(result.chats[0]?.messages).toHaveLength(2);
  });

  it("falha com erro tipado quando origem nao existe", async () => {
    const reader = new FileChatImportReader();

    await expect(
      reader.read({
        sourcePath: "/tmp/nao-existe-graphmemo-chat-import",
        provider: "generic"
      })
    ).rejects.toEqual(
      expect.objectContaining<Partial<GraphMemoError>>({
        code: "CHAT_SOURCE_NOT_FOUND"
      })
    );
  });
});
