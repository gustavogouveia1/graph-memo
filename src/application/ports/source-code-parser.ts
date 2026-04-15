import type { SourceExport } from "../../core/indexing/source-export";
import type { SourceImport } from "../../core/indexing/source-import";
import type { SourceSymbol } from "../../core/indexing/source-symbol";

export interface ParsedSourceCode {
  imports: SourceImport[];
  exports: SourceExport[];
  symbols: SourceSymbol[];
}

export interface SourceCodeParserPort {
  parse(filePath: string, content: string): ParsedSourceCode;
}
