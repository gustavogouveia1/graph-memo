import type {
  MemoryEdge,
  MemoryEvent,
  MemoryFact,
  MemoryMeta,
  MemoryNode,
  MemoryTask
} from "../../core/memory/memory-types";

export interface MemoryState {
  meta: MemoryMeta;
  nodes: MemoryNode[];
  edges: MemoryEdge[];
  facts: MemoryFact[];
  events: MemoryEvent[];
  tasks: MemoryTask[];
}

export interface MemoryStorePort {
  load(rootPath: string): Promise<MemoryState | null>;
  save(rootPath: string, state: MemoryState): Promise<void>;
}

