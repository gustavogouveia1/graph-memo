import type { SourceExport } from "./source-export";
import type { SourceImport } from "./source-import";
import type { SourceSymbol } from "./source-symbol";

export interface IndexedFile {
  relativePath: string;
  extension: string;
  size: number;
  mtimeMs: number;
  hash: string;
  imports: SourceImport[];
  exports: SourceExport[];
  symbols: SourceSymbol[];
}
