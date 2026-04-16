import { join } from "node:path";

import { resolveStateIndexPaths } from "./state-index-paths";

export const MEMORY_DIRECTORY_NAME = "memory";
export const MEMORY_META_FILE_NAME = "meta.json";
export const MEMORY_NODES_FILE_NAME = "nodes.json";
export const MEMORY_EDGES_FILE_NAME = "edges.json";
export const MEMORY_FACTS_FILE_NAME = "facts.json";
export const MEMORY_EVENTS_FILE_NAME = "events.json";
export const MEMORY_TASKS_FILE_NAME = "tasks.json";

export interface MemoryStatePaths {
  memoryDirectoryPath: string;
  metaFilePath: string;
  nodesFilePath: string;
  edgesFilePath: string;
  factsFilePath: string;
  eventsFilePath: string;
  tasksFilePath: string;
}

export function resolveMemoryStatePaths(rootPath: string, stateDir: string): MemoryStatePaths {
  const { stateDirectoryPath } = resolveStateIndexPaths(rootPath, stateDir);
  const memoryDirectoryPath = join(stateDirectoryPath, MEMORY_DIRECTORY_NAME);

  return {
    memoryDirectoryPath,
    metaFilePath: join(memoryDirectoryPath, MEMORY_META_FILE_NAME),
    nodesFilePath: join(memoryDirectoryPath, MEMORY_NODES_FILE_NAME),
    edgesFilePath: join(memoryDirectoryPath, MEMORY_EDGES_FILE_NAME),
    factsFilePath: join(memoryDirectoryPath, MEMORY_FACTS_FILE_NAME),
    eventsFilePath: join(memoryDirectoryPath, MEMORY_EVENTS_FILE_NAME),
    tasksFilePath: join(memoryDirectoryPath, MEMORY_TASKS_FILE_NAME)
  };
}
