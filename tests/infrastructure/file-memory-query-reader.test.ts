import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { MEMORY_SCHEMA_VERSION } from "../../src/core/memory/memory-types";
import { FileMemoryQueryReader } from "../../src/infrastructure/persistence/file-memory-query-reader";

const tempDirectories: string[] = [];

async function createWorkspace(): Promise<string> {
  const workspace = await mkdtemp(join(tmpdir(), "graphmemo-memory-query-reader-"));
  tempDirectories.push(workspace);
  return workspace;
}

describe("FileMemoryQueryReader", () => {
  afterEach(async () => {
    await Promise.all(
      tempDirectories.map(async (directory) => {
        await rm(directory, { recursive: true, force: true });
      })
    );
    tempDirectories.length = 0;
  });

  it("carrega estado de memoria valido de .graphmemo/memory", async () => {
    const workspace = await createWorkspace();
    const statePath = join(workspace, ".graphmemo", "memory");
    await mkdir(statePath, { recursive: true });

    await writeFile(
      join(statePath, "meta.json"),
      JSON.stringify(
        {
          schemaVersion: MEMORY_SCHEMA_VERSION,
          createdAt: "2026-04-16T00:00:00.000Z",
          lastUpdatedAt: "2026-04-16T00:00:00.000Z"
        },
        null,
        2
      ),
      "utf8"
    );

    await writeFile(join(statePath, "nodes.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "edges.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "facts.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "events.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "tasks.json"), JSON.stringify([], null, 2), "utf8");

    const reader = new FileMemoryQueryReader();
    const result = await reader.read(workspace);

    expect(result.meta.schemaVersion).toBe(MEMORY_SCHEMA_VERSION);
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it("carrega estado de memoria valido de stateDir customizado", async () => {
    const workspace = await createWorkspace();
    const customStateDir = ".graphmemo-state";
    const statePath = join(workspace, customStateDir, "memory");
    await mkdir(statePath, { recursive: true });

    await writeFile(
      join(statePath, "meta.json"),
      JSON.stringify(
        {
          schemaVersion: MEMORY_SCHEMA_VERSION,
          createdAt: "2026-04-16T00:00:00.000Z",
          lastUpdatedAt: "2026-04-16T00:00:00.000Z"
        },
        null,
        2
      ),
      "utf8"
    );

    await writeFile(join(statePath, "nodes.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "edges.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "facts.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "events.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "tasks.json"), JSON.stringify([], null, 2), "utf8");

    const reader = new FileMemoryQueryReader(customStateDir);
    const result = await reader.read(workspace);

    expect(result.meta.schemaVersion).toBe(MEMORY_SCHEMA_VERSION);
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it("retorna erro tipado quando estado de memoria nao existe", async () => {
    const workspace = await createWorkspace();
    const reader = new FileMemoryQueryReader();

    await expect(reader.read(workspace)).rejects.toEqual(
      expect.objectContaining({
        code: "MEMORY_NOT_FOUND"
      })
    );
  });

  it("retorna erro tipado quando contrato de memoria e invalido", async () => {
    const workspace = await createWorkspace();
    const statePath = join(workspace, ".graphmemo", "memory");
    await mkdir(statePath, { recursive: true });

    await writeFile(join(statePath, "meta.json"), `{"schemaVersion":"${MEMORY_SCHEMA_VERSION}"`, "utf8");
    await writeFile(join(statePath, "nodes.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "edges.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "facts.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "events.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "tasks.json"), JSON.stringify([], null, 2), "utf8");

    const reader = new FileMemoryQueryReader();

    await expect(reader.read(workspace)).rejects.toEqual(
      expect.objectContaining({
        code: "MEMORY_CORRUPTED"
      })
    );
  });

  it("retorna erro tipado quando versao de schema nao e suportada", async () => {
    const workspace = await createWorkspace();
    const statePath = join(workspace, ".graphmemo", "memory");
    await mkdir(statePath, { recursive: true });

    await writeFile(
      join(statePath, "meta.json"),
      JSON.stringify(
        {
          schemaVersion: "999",
          createdAt: "2026-04-16T00:00:00.000Z",
          lastUpdatedAt: "2026-04-16T00:00:00.000Z"
        },
        null,
        2
      ),
      "utf8"
    );

    await writeFile(join(statePath, "nodes.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "edges.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "facts.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "events.json"), JSON.stringify([], null, 2), "utf8");
    await writeFile(join(statePath, "tasks.json"), JSON.stringify([], null, 2), "utf8");

    const reader = new FileMemoryQueryReader();

    await expect(reader.read(workspace)).rejects.toEqual(
      expect.objectContaining({
        code: "MEMORY_SCHEMA_UNSUPPORTED"
      })
    );
  });
});

