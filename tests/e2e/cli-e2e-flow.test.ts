import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  cleanupTempDirectories,
  createFixtureConfig,
  createWorkspaceFromFixture,
  runCliCommand
} from "./cli-e2e-helpers";

const tempDirectories: string[] = [];

describe("CLI e2e flow with realistic fixture", () => {
  afterEach(async () => {
    await cleanupTempDirectories(tempDirectories);
  });

  it("executa index, query, import-chats e context em sequencia", async () => {
    const workspace = await createWorkspaceFromFixture(tempDirectories);
    const config = createFixtureConfig(workspace);

    const indexRun = await runCliCommand(config, ["index", workspace]);
    expect(indexRun.errors).toEqual([]);
    expect(indexRun.logs[0]).toContain("[SUCCESS] index:");

    const manifestPath = join(workspace, ".graphmemo", "manifest.json");
    const filesPath = join(workspace, ".graphmemo", "files.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
      indexedFilesCount: number;
    };
    const indexedFiles = JSON.parse(await readFile(filesPath, "utf8")) as Array<{
      relativePath: string;
    }>;

    expect(manifest.indexedFilesCount).toBe(5);
    expect(indexedFiles.map((file) => file.relativePath)).toContain(
      "src/domain/commission-policy.ts"
    );

    const queryRun = await runCliCommand(config, [
      "query",
      workspace,
      "--symbol",
      "calculateCommission"
    ]);
    expect(queryRun.errors).toEqual([]);
    expect(queryRun.logs[0]).toContain("[SUCCESS] query:");
    const queryDetails = extractJsonDetails(queryRun.logs) as {
      filesBySymbol?: string[];
      exportsBySymbol?: Array<{ filePath: string; exportName: string }>;
    };

    expect(queryDetails.filesBySymbol).toContain("src/domain/commission-policy.ts");
    expect(queryDetails.exportsBySymbol).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          filePath: "src/domain/commission-policy.ts",
          exportName: "calculateCommission"
        })
      ])
    );

    const chatsSource = join(workspace, "chat-exports");
    const importRun = await runCliCommand(config, [
      "import-chats",
      "--source",
      chatsSource,
      "--provider",
      "generic"
    ]);
    expect(importRun.errors).toEqual([]);
    expect(importRun.logs[0]).toContain("[SUCCESS] import-chats:");
    const importDetails = extractJsonDetails(importRun.logs) as {
      persistedNotesCount?: number;
      persistedNotes?: string[];
    };

    expect(importDetails.persistedNotesCount).toBe(1);
    expect(importDetails.persistedNotes?.[0]).toMatch(/^imports\/.+\.md$/);

    const importedFiles = await readdir(join(workspace, "knowledge", "imports"));
    expect(importedFiles).toHaveLength(1);
    const importedNote = await readFile(
      join(workspace, "knowledge", "imports", importedFiles[0] ?? ""),
      "utf8"
    );
    expect(importedNote).toContain("calculateCommission");

    const contextRun = await runCliCommand(config, [
      "context",
      workspace,
      "--task",
      "corrigir calculo de comissao premium",
      "--format",
      "json"
    ]);
    expect(contextRun.errors).toEqual([]);
    expect(contextRun.logs[0]).toContain("[SUCCESS] context:");
    const contextDetails = extractJsonDetails(contextRun.logs) as {
      relevantFiles?: string[];
      relevantKnowledgeNotes?: string[];
      relevantAdrsAndDocs?: string[];
      suggestedStartingPoints?: string[];
    };

    expect(contextDetails.relevantFiles).toContain("src/domain/commission-policy.ts");
    expect(contextDetails.relevantKnowledgeNotes).toEqual(
      expect.arrayContaining(["knowledge/features/2026-04-10-ajuste-comissao-premium.md"])
    );
    expect(
      contextDetails.relevantKnowledgeNotes?.some((path) => path.startsWith("knowledge/imports/"))
    ).toBe(true);
    expect(contextDetails.relevantAdrsAndDocs).toEqual(
      expect.arrayContaining(["docs/adr/ADR-001-commission-rounding-policy.md"])
    );
    expect((contextDetails.suggestedStartingPoints ?? []).length).toBeGreaterThan(0);
  });

  it("respeita stateDir customizado no fluxo index -> query", async () => {
    const workspace = await createWorkspaceFromFixture(tempDirectories);
    const config = {
      ...createFixtureConfig(workspace),
      stateDir: ".graphmemo-state"
    };

    const indexRun = await runCliCommand(config, ["index", workspace]);
    expect(indexRun.errors).toEqual([]);
    expect(indexRun.logs[0]).toContain("[SUCCESS] index:");

    const manifestPath = join(workspace, ".graphmemo-state", "manifest.json");
    const filesPath = join(workspace, ".graphmemo-state", "files.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
      indexedFilesCount: number;
    };
    const indexedFiles = JSON.parse(await readFile(filesPath, "utf8")) as Array<{
      relativePath: string;
    }>;

    expect(manifest.indexedFilesCount).toBeGreaterThan(0);
    expect(indexedFiles.length).toBeGreaterThan(0);

    const queryRun = await runCliCommand(config, [
      "query",
      workspace,
      "--symbol",
      "calculateCommission"
    ]);
    expect(queryRun.errors).toEqual([]);
    expect(queryRun.logs[0]).toContain("[SUCCESS] query:");
  });
});

function extractJsonDetails(logs: string[]): Record<string, unknown> {
  const details = [...logs].reverse().find((entry) => entry.trim().startsWith("{"));
  if (details === undefined) {
    throw new Error("Nao foi possivel localizar JSON de detalhes na saida da CLI.");
  }

  return JSON.parse(details) as Record<string, unknown>;
}
