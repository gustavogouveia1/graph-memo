import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { formatGraphMemoErrorForCli } from "../../src/cli/user-error-output";
import { GraphMemoError } from "../../src/core/errors/graphmemo-error";
import {
  cleanupTempDirectories,
  createBareWorkspace,
  createFixtureConfig,
  createWorkspaceFromFixture,
  runCliCommand,
  runMainScript
} from "./cli-e2e-helpers";

const tempDirectories: string[] = [];

describe("CLI e2e cenarios negativos", () => {
  afterEach(async () => {
    await cleanupTempDirectories(tempDirectories);
  });

  it("context sem indice local retorna INDEX_NOT_FOUND com instrucao de indexacao", async () => {
    const workspace = await createBareWorkspace(tempDirectories);
    const config = createFixtureConfig(workspace);

    await expect(
      runCliCommand(config, ["context", workspace, "--task", "qualquer task", "--format", "json"])
    ).rejects.toMatchObject({
      code: "INDEX_NOT_FOUND",
      message: expect.stringMatching(/graphmemo index/i)
    } as Partial<GraphMemoError>);
  });

  it("query sem indice local retorna INDEX_NOT_FOUND com instrucao de indexacao", async () => {
    const workspace = await createBareWorkspace(tempDirectories);
    const config = createFixtureConfig(workspace);

    await expect(runCliCommand(config, ["query", workspace, "--list-files"])).rejects.toMatchObject(
      {
        code: "INDEX_NOT_FOUND",
        message: expect.stringMatching(/graphmemo index/i)
      } as Partial<GraphMemoError>
    );
  });

  it("query com manifest corrompido retorna INDEX_CORRUPTED com instrucao --full", async () => {
    const workspace = await createWorkspaceFromFixture(tempDirectories);
    const config = createFixtureConfig(workspace);
    const stateDir = join(workspace, ".graphmemo");
    await mkdir(stateDir, { recursive: true });
    await writeFile(join(stateDir, "manifest.json"), "{invalid-json", "utf8");
    await writeFile(join(stateDir, "files.json"), "[]", "utf8");

    await expect(runCliCommand(config, ["query", workspace, "--list-files"])).rejects.toMatchObject(
      {
        code: "INDEX_CORRUPTED",
        message: expect.stringMatching(/--full/i)
      } as Partial<GraphMemoError>
    );
  });

  it("context com files.json corrompido retorna INDEX_CORRUPTED com instrucao --full", async () => {
    const workspace = await createWorkspaceFromFixture(tempDirectories);
    const config = createFixtureConfig(workspace);
    const stateDir = join(workspace, ".graphmemo");
    await mkdir(stateDir, { recursive: true });
    await writeFile(
      join(stateDir, "manifest.json"),
      JSON.stringify({
        schemaVersion: "1",
        generatedAt: "2026-04-15T00:00:00.000Z",
        rootPath: workspace,
        indexedFilesCount: 0,
        supportedExtensions: [".ts"]
      }),
      "utf8"
    );
    await writeFile(join(stateDir, "files.json"), "[broken", "utf8");

    await expect(
      runCliCommand(config, [
        "context",
        workspace,
        "--task",
        "ajustar fluxo de indexacao",
        "--format",
        "json"
      ])
    ).rejects.toMatchObject({
      code: "INDEX_CORRUPTED",
      message: expect.stringMatching(/--full/i)
    } as Partial<GraphMemoError>);
  });

  it("import-chats com source inexistente retorna CHAT_SOURCE_NOT_FOUND sem stack na formatacao CLI", async () => {
    const workspace = await createWorkspaceFromFixture(tempDirectories);
    const config = createFixtureConfig(workspace);
    const invalidSource = join(workspace, "nao-existe-chat-export");

    try {
      await runCliCommand(config, [
        "import-chats",
        "--source",
        invalidSource,
        "--provider",
        "generic"
      ]);
      expect.fail("Esperava falha na importacao.");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(GraphMemoError);
      const graphMemoError = error as GraphMemoError;
      expect(graphMemoError.code).toBe("CHAT_SOURCE_NOT_FOUND");
      expect(graphMemoError.message).toMatch(/--source/i);
      const line = formatGraphMemoErrorForCli(graphMemoError);
      expect(line).not.toMatch(/\s+at\s+/);
      expect(line).not.toMatch(/ENOENT/i);
    }
  });

  it("query sem filtros retorna QUERY_INVALID_INPUT objetivo", async () => {
    const workspace = await createWorkspaceFromFixture(tempDirectories);
    const config = createFixtureConfig(workspace);

    await expect(runCliCommand(config, ["query", workspace])).rejects.toMatchObject({
      code: "QUERY_INVALID_INPUT",
      message: expect.stringMatching(/--symbol|--module|--file|--list-files|filtro/i)
    } as Partial<GraphMemoError>);
  });

  it("query com --symbol vazio retorna QUERY_INVALID_INPUT", async () => {
    const workspace = await createWorkspaceFromFixture(tempDirectories);
    const config = createFixtureConfig(workspace);

    await expect(runCliCommand(config, ["query", workspace, "--symbol", ""])).rejects.toMatchObject(
      {
        code: "QUERY_INVALID_INPUT"
      } as Partial<GraphMemoError>
    );
  });

  it("context com task apenas em branco retorna CONTEXT_INVALID_INPUT", async () => {
    const workspace = await createWorkspaceFromFixture(tempDirectories);
    const config = createFixtureConfig(workspace);

    await expect(
      runCliCommand(config, ["context", workspace, "--task", "   ", "--format", "json"])
    ).rejects.toMatchObject({
      code: "CONTEXT_INVALID_INPUT",
      message: expect.stringMatching(/--task/i)
    } as Partial<GraphMemoError>);
  });

  it("context com --symbol vazio retorna CONTEXT_INVALID_INPUT", async () => {
    const workspace = await createWorkspaceFromFixture(tempDirectories);
    const config = createFixtureConfig(workspace);

    await expect(
      runCliCommand(config, [
        "context",
        workspace,
        "--task",
        "task valida",
        "--symbol",
        "",
        "--format",
        "json"
      ])
    ).rejects.toMatchObject({
      code: "CONTEXT_INVALID_INPUT"
    } as Partial<GraphMemoError>);
  });

  it("processo real (main) termina com codigo 1 em falha tipica de indice", async () => {
    const workspace = await createBareWorkspace(tempDirectories);
    const { exitCode, stderr } = await runMainScript(["query", workspace, "--list-files"]);

    expect(exitCode).toBe(1);
    expect(stderr.trim()).toMatch(/^\[INDEX_NOT_FOUND\]/);
    expect(stderr).toMatch(/graphmemo index/i);
    expect(stderr).not.toMatch(/\s+at\s+/);
  });
});
