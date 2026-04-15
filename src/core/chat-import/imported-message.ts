export const CHAT_MESSAGE_ROLES = ["user", "assistant", "system", "tool", "unknown"] as const;

export type ImportedMessageRole = (typeof CHAT_MESSAGE_ROLES)[number];

export interface ImportedMessage {
  role: ImportedMessageRole;
  content: string;
  timestamp?: string;
}
