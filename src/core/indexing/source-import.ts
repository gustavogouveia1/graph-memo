export type SourceImportKind = "value" | "type";

export interface SourceImport {
  source: string;
  isTypeOnly: boolean;
  name?: string;
  kind?: SourceImportKind;
  isDefault?: boolean;
  importedAs?: string;
}
