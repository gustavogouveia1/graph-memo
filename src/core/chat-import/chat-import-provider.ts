export const CHAT_IMPORT_PROVIDERS = ["generic", "claude", "cursor", "chatgpt"] as const;

export type ChatImportProvider = (typeof CHAT_IMPORT_PROVIDERS)[number];
