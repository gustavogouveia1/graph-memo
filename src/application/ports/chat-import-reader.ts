import type { ChatImportProvider } from "../../core/chat-import/chat-import-provider";
import type { ImportedChat } from "../../core/chat-import/imported-chat";

export interface ChatImportReadInput {
  sourcePath: string;
  provider: ChatImportProvider;
}

export interface ChatImportReadResult {
  chats: ImportedChat[];
  scannedFilesCount: number;
  parsedFilesCount: number;
  fallbackFilesCount: number;
}

export interface ChatImportReaderPort {
  read(input: ChatImportReadInput): Promise<ChatImportReadResult>;
}
