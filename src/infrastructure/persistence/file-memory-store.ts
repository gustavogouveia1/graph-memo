import { mkdir, readFile, writeFile } from "node:fs/promises";

import type { MemoryStorePort, MemoryState } from "../../application/ports/memory-store";
import { DEFAULT_STATE_DIR } from "../../shared/config/state-index-paths";
import { resolveMemoryStatePaths } from "../../shared/config/state-memory-paths";

export class FileMemoryStore implements MemoryStorePort {
  constructor(private readonly stateDir: string = DEFAULT_STATE_DIR) {}

  async load(rootPath: string): Promise<MemoryState | null> {
    try {
      const {
        metaFilePath,
        nodesFilePath,
        edgesFilePath,
        factsFilePath,
        eventsFilePath,
        tasksFilePath
      } = resolveMemoryStatePaths(rootPath, this.stateDir);

      const [
        metaContent,
        nodesContent,
        edgesContent,
        factsContent,
        eventsContent,
        tasksContent
      ] = await Promise.all([
        readFile(metaFilePath, "utf8"),
        readFile(nodesFilePath, "utf8"),
        readFile(edgesFilePath, "utf8"),
        readFile(factsFilePath, "utf8"),
        readFile(eventsFilePath, "utf8"),
        readFile(tasksFilePath, "utf8")
      ]);

      return {
        meta: JSON.parse(metaContent),
        nodes: JSON.parse(nodesContent),
        edges: JSON.parse(edgesContent),
        facts: JSON.parse(factsContent),
        events: JSON.parse(eventsContent),
        tasks: JSON.parse(tasksContent)
      } as MemoryState;
    } catch {
      return null;
    }
  }

  async save(rootPath: string, state: MemoryState): Promise<void> {
    const {
      memoryDirectoryPath,
      metaFilePath,
      nodesFilePath,
      edgesFilePath,
      factsFilePath,
      eventsFilePath,
      tasksFilePath
    } = resolveMemoryStatePaths(rootPath, this.stateDir);

    await mkdir(memoryDirectoryPath, { recursive: true });
    await Promise.all([
      writeFile(metaFilePath, JSON.stringify(state.meta, null, 2), "utf8"),
      writeFile(nodesFilePath, JSON.stringify(state.nodes, null, 2), "utf8"),
      writeFile(edgesFilePath, JSON.stringify(state.edges, null, 2), "utf8"),
      writeFile(factsFilePath, JSON.stringify(state.facts, null, 2), "utf8"),
      writeFile(eventsFilePath, JSON.stringify(state.events, null, 2), "utf8"),
      writeFile(tasksFilePath, JSON.stringify(state.tasks, null, 2), "utf8")
    ]);
  }
}

