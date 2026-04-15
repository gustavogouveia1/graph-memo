import type { StoredIndex } from "./index-store";

export interface IndexQueryReaderPort {
  read(rootPath: string): Promise<StoredIndex>;
}
