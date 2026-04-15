import type { IndexedFile } from "../../core/indexing/indexed-file";
import type { IndexManifest } from "../../core/indexing/index-manifest";

export interface StoredIndex {
  manifest: IndexManifest;
  files: IndexedFile[];
}

export interface IndexStorePort {
  load(rootPath: string): Promise<StoredIndex | null>;
  save(rootPath: string, index: StoredIndex): Promise<void>;
}
