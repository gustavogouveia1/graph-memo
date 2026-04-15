import type { ContextKnowledgeDocument } from "../../core/context/context-types";

export interface KnowledgeContextReaderPort {
  readDocuments(rootPath: string): Promise<ContextKnowledgeDocument[]>;
}
