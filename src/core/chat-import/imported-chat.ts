import type { ChatImportProvider } from "./chat-import-provider";
import type { ImportedMessage } from "./imported-message";

export interface ImportedChat {
  provider: ChatImportProvider;
  sourceFile: string;
  topic: string;
  messages: ImportedMessage[];
}
