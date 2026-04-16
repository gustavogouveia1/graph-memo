import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { MEMORY_SCHEMA_VERSION } from "../../src/core/memory/memory-types";
import type { MemoryState } from "../../src/application/ports/memory-store";
import { FileMemoryQueryReader } from "../../src/infrastructure/persistence/file-memory-query-reader";
import { FileMemoryStore } from "../../src/infrastructure/persistence/file-memory-store";

const tempDirectories: string[] = [];

async function createWorkspace(): Promise<string> {
  const workspace = await mkdtemp(join(tmpdir(), "graphmemo-memory-"));
  tempDirectories.push(workspace);
  return workspace;
}

describe("Memory persistence flow integration", () => {
  afterEach(async () => {
    await Promise.all(
      tempDirectories.map(async (directory) => {
        await rm(directory, { recursive: true, force: true });
      })
    );
    tempDirectories.length = 0;
  });

  it("persiste e carrega estado de memoria em .graphmemo/memory", async () => {
    const workspace = await createWorkspace();

    const store = new FileMemoryStore();
    const reader = new FileMemoryQueryReader();

    const state: MemoryState = {
      meta: {
        schemaVersion: MEMORY_SCHEMA_VERSION,
        createdAt: "2026-04-16T00:00:00.000Z",
        lastUpdatedAt: "2026-04-16T00:00:00.000Z"
      },
      nodes: [],
      edges: [],
      facts: [],
      events: [],
      tasks: []
    };

    await store.save(workspace, state);

    const loaded = await reader.read(workspace);

    expect(loaded.meta.schemaVersion).toBe(MEMORY_SCHEMA_VERSION);
    expect(loaded.nodes).toEqual([]);
    expect(loaded.edges).toEqual([]);

    const metaRaw = await readFile(join(workspace, ".graphmemo", "memory", "meta.json"), "utf8");
    const metaJson = JSON.parse(metaRaw) as { schemaVersion: string };
    expect(metaJson.schemaVersion).toBe(MEMORY_SCHEMA_VERSION);
  });

  it("persiste estado de memoria no stateDir configurado", async () => {
    const workspace = await createWorkspace();
    const customStateDir = ".graphmemo-state";

    const store = new FileMemoryStore(customStateDir);
    const reader = new FileMemoryQueryReader(customStateDir);

    const state: MemoryState = {
      meta: {
        schemaVersion: MEMORY_SCHEMA_VERSION,
        createdAt: "2026-04-16T00:00:00.000Z",
        lastUpdatedAt: "2026-04-16T00:00:00.000Z"
      },
      nodes: [],
      edges: [],
      facts: [],
      events: [],
      tasks: []
    };

    await store.save(workspace, state);

    const loaded = await reader.read(workspace);

    expect(loaded.meta.schemaVersion).toBe(MEMORY_SCHEMA_VERSION);

    const metaRaw = await readFile(
      join(workspace, customStateDir, "memory", "meta.json"),
      "utf8"
    );
    const metaJson = JSON.parse(metaRaw) as { schemaVersion: string };
    expect(metaJson.schemaVersion).toBe(MEMORY_SCHEMA_VERSION);
  });
});

