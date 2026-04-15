import type { NormalizedChatNote } from "../../core/chat-import/normalized-chat-note";

export interface KnowledgeWriteResult {
  relativePath: string;
}

export interface KnowledgeWriterPort {
  writeChatNotes(rootPath: string, notes: NormalizedChatNote[]): Promise<KnowledgeWriteResult[]>;
}
