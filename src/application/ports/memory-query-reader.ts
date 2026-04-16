import type { MemoryState } from "./memory-store";

export interface MemoryQueryReaderPort {
  read(rootPath: string): Promise<MemoryState>;
}

