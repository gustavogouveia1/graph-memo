import type { ChatImportProvider } from "./chat-import-provider";
import type { ImportedMessage } from "./imported-message";

export interface NormalizedChatNote {
  title: string;
  topic: string;
  provider: ChatImportProvider;
  sourceFile: string;
  importedAt: string;
  tags: string[];
  related: string[];
  messages: ImportedMessage[];
  noteFileName: string;
  noteContent: string;
}
