export interface ContextBuildFilters {
  symbol?: string;
  file?: string;
  moduleSource?: string;
}

export interface StructuralContextResult {
  task: string;
  extractedTerms: string[];
  relevantFiles: string[];
  relevantSymbols: string[];
  relevantModules: string[];
  fileRelations: Array<{
    filePath: string;
    dependsOn: string[];
    importedBy: string[];
  }>;
}

export type ContextKnowledgeCategory = "knowledge-note" | "knowledge-import" | "adr" | "engineering-doc";

export interface ContextKnowledgeDocument {
  relativePath: string;
  title: string;
  content: string;
  category: ContextKnowledgeCategory;
}

export interface KnowledgeContextResult {
  relevantKnowledgeNotes: string[];
  relevantAdrsAndDocs: string[];
}

export interface BuiltContextPackage extends StructuralContextResult, KnowledgeContextResult {
  suggestedStartingPoints: string[];
}
