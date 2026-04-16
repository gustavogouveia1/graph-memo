import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { FileIndexQueryReader } from "../../src/infrastructure/persistence/file-index-query-reader";

const tempDirectories: string[] = [];

async function createWorkspace(): Promise<string> {
  const workspace = await mkdtemp(join(tmpdir(), "graphmemo-query-reader-"));
  tempDirectories.push(workspace);
  return workspace;
}

describe("FileIndexQueryReader", () => {
  afterEach(async () => {
    await Promise.all(
      tempDirectories.map(async (directory) => {
        await rm(directory, { recursive: true, force: true });
      })
    );
    tempDirectories.length = 0;
  });

  it("carrega indice valido de .graphmemo", async () => {
    const workspace = await createWorkspace();
    const statePath = join(workspace, ".graphmemo");
    await mkdir(statePath, { recursive: true });

    await writeFile(
      join(statePath, "manifest.json"),
      JSON.stringify({
        schemaVersion: "1",
        generatedAt: "2026-04-15T00:00:00.000Z",
        rootPath: workspace,
        indexedFilesCount: 1,
        supportedExtensions: [".ts"]
      }),
      "utf8"
    );
    await writeFile(
      join(statePath, "files.json"),
      JSON.stringify([
        {
          relativePath: "src/index.ts",
          extension: ".ts",
          size: 10,
          mtimeMs: 1,
          hash: "abc",
          imports: [],
          exports: [],
          symbols: []
        }
      ]),
      "utf8"
    );

    const reader = new FileIndexQueryReader();
    const result = await reader.read(workspace);

    expect(result.manifest.indexedFilesCount).toBe(1);
    expect(result.files).toHaveLength(1);
  });

  it("carrega indice valido de stateDir customizado", async () => {
    const workspace = await createWorkspace();
    const customStateDir = ".graphmemo-state";
    const statePath = join(workspace, customStateDir);
    await mkdir(statePath, { recursive: true });

    await writeFile(
      join(statePath, "manifest.json"),
      JSON.stringify({
        schemaVersion: "1",
        generatedAt: "2026-04-15T00:00:00.000Z",
        rootPath: workspace,
        indexedFilesCount: 1,
        supportedExtensions: [".ts"]
      }),
      "utf8"
    );
    await writeFile(
      join(statePath, "files.json"),
      JSON.stringify([
        {
          relativePath: "src/index.ts",
          extension: ".ts",
          size: 10,
          mtimeMs: 1,
          hash: "abc",
          imports: [],
          exports: [],
          symbols: []
        }
      ]),
      "utf8"
    );

    const reader = new FileIndexQueryReader(customStateDir);
    const result = await reader.read(workspace);

    expect(result.manifest.indexedFilesCount).toBe(1);
    expect(result.files).toHaveLength(1);
  });

  it("retorna erro tipado quando indice nao existe", async () => {
    const workspace = await createWorkspace();
    const reader = new FileIndexQueryReader();

    await expect(reader.read(workspace)).rejects.toEqual(
      expect.objectContaining({
        code: "INDEX_NOT_FOUND"
      })
    );
  });

  it("retorna erro tipado quando contrato do indice e invalido", async () => {
    const workspace = await createWorkspace();
    const statePath = join(workspace, ".graphmemo");
    await mkdir(statePath, { recursive: true });

    await writeFile(join(statePath, "manifest.json"), `{"schemaVersion":"1"`, "utf8");
    await writeFile(join(statePath, "files.json"), "[]", "utf8");

    const reader = new FileIndexQueryReader();

    await expect(reader.read(workspace)).rejects.toEqual(
      expect.objectContaining({
        code: "INDEX_CORRUPTED"
      })
    );
  });
});
