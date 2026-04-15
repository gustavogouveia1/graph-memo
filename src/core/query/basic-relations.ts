import type { SourceExport } from "../indexing/source-export";
import type { SourceImport } from "../indexing/source-import";
import type { SourceSymbol } from "../indexing/source-symbol";

export interface FileDefinesSymbolRelation {
  type: "file_defines_symbol";
  filePath: string;
  symbol: SourceSymbol;
}

export interface FileImportsModuleRelation {
  type: "file_imports_module";
  filePath: string;
  source: string;
  importEntry: SourceImport;
}

export interface FileExportsSymbolRelation {
  type: "file_exports_symbol";
  filePath: string;
  symbolName: string;
  exportEntry: SourceExport;
}

export type BasicGraphRelation =
  | FileDefinesSymbolRelation
  | FileImportsModuleRelation
  | FileExportsSymbolRelation;

export interface QueryMatchOptions {
  caseSensitive?: boolean;
  exactMatch?: boolean;
}
