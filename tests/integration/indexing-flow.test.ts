import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { Logger } from "../../src/application/ports/logger";
import { RunIndexUseCase } from "../../src/application/use-cases/run-index.use-case";
import { NodeFileSystem } from "../../src/infrastructure/filesystem/node-file-system";
import { TypeScriptSourceCodeParser } from "../../src/infrastructure/parsing/typescript/typescript-source-code-parser";
import { FileIndexStore } from "../../src/infrastructure/persistence/file-index-store";

const tempDirectories: string[] = [];

function createLoggerStub(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
}

async function createWorkspace(): Promise<string> {
  const workspace = await mkdtemp(join(tmpdir(), "graphmemo-index-"));
  tempDirectories.push(workspace);
  return workspace;
}

describe("Indexing flow integration", () => {
  afterEach(async () => {
    await Promise.all(
      tempDirectories.map(async (directory) => {
        await rm(directory, { recursive: true, force: true });
      })
    );
    tempDirectories.length = 0;
  });

  it("gera manifesto e arquivos indexados em .graphmemo", async () => {
    const workspace = await createWorkspace();
    const srcDirectory = join(workspace, "src");
    const ignoredDirectory = join(workspace, "node_modules");
    await mkdir(srcDirectory, { recursive: true });
    await mkdir(ignoredDirectory, { recursive: true });

    await writeFile(
      join(srcDirectory, "indexer.ts"),
      `import { helper } from "./helper"; export function runIndex() { return helper(); }`,
      "utf8"
    );
    await writeFile(join(srcDirectory, "helper.js"), `export function helper() { return 1; }`, "utf8");
    await writeFile(join(ignoredDirectory, "lib.ts"), `export const ignored = true;`, "utf8");

    const useCase = new RunIndexUseCase(
      createLoggerStub(),
      new NodeFileSystem(),
      new TypeScriptSourceCodeParser(),
      new FileIndexStore()
    );

    const firstRun = await useCase.execute({
      targetPath: workspace,
      fullReindex: false,
      dryRun: false
    });

    expect(firstRun.status).toBe("success");
    expect(firstRun.details).toMatchObject({
      indexedFilesCount: 2,
      parsedFilesCount: 2,
      reusedFilesCount: 0
    });

    const manifestRaw = await readFile(join(workspace, ".graphmemo", "manifest.json"), "utf8");
    const filesRaw = await readFile(join(workspace, ".graphmemo", "files.json"), "utf8");
    const manifest = JSON.parse(manifestRaw) as {
      schemaVersion: string;
      indexedFilesCount: number;
      supportedExtensions: string[];
    };
    const files = JSON.parse(filesRaw) as Array<{
      relativePath: string;
      imports: Array<{ source: string }>;
      exports: Array<{ name: string }>;
      symbols: Array<{ name: string; kind: string }>;
    }>;

    expect(manifest.schemaVersion).toBe("1");
    expect(manifest.indexedFilesCount).toBe(2);
    expect(manifest.supportedExtensions).toEqual([".ts", ".tsx", ".js", ".jsx"]);
    expect(files.map((item) => item.relativePath)).toEqual(["src/helper.js", "src/indexer.ts"]);
    expect(files.find((item) => item.relativePath === "src/indexer.ts")?.imports).toEqual(
      expect.arrayContaining([expect.objectContaining({ source: "./helper" })])
    );
    expect(files.find((item) => item.relativePath === "src/indexer.ts")?.symbols).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "runIndex", kind: "function" })])
    );

    const secondRun = await useCase.execute({
      targetPath: workspace,
      fullReindex: false,
      dryRun: false
    });

    expect(secondRun.status).toBe("success");
    expect(secondRun.details).toMatchObject({
      indexedFilesCount: 2,
      parsedFilesCount: 0,
      reusedFilesCount: 2
    });
  });
});
