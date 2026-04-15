export type SourceExportKind = "function" | "class" | "value" | "type";

export interface SourceExport {
  name: string;
  kind: SourceExportKind;
  source?: string;
  isDefault?: boolean;
  isTypeOnly?: boolean;
  exportedAs?: string;
}
