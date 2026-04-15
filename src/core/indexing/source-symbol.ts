export type SourceSymbolKind = "function" | "class";

export interface SourceSymbol {
  name: string;
  kind: SourceSymbolKind;
}
