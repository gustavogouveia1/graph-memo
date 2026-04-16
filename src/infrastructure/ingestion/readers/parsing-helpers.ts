import { basename, extname } from "node:path";

import type { ChatImportProvider } from "../../../core/chat-import/chat-import-provider";
import type { ImportedChat } from "../../../core/chat-import/imported-chat";
import {
  CHAT_MESSAGE_ROLES,
  type ImportedMessage,
  type ImportedMessageRole
} from "../../../core/chat-import/imported-message";

export interface ReaderParseInput {
  provider: ChatImportProvider;
  sourceFile: string;
  rawContent: string;
}

export interface ProviderReader {
  parse(input: ReaderParseInput): ImportedChat[];
}

export function parseAsJson(rawContent: string): unknown | null {
  try {
    return JSON.parse(rawContent);
  } catch {
    return null;
  }
}

export function parseGenericInput(input: ReaderParseInput): ImportedChat[] {
  const parsedJson = parseAsJson(input.rawContent);
  if (parsedJson !== null) {
    const chats = parseGenericFromJson(input.provider, input.sourceFile, parsedJson);
    if (chats.length > 0) {
      return chats;
    }
  }

  return parseGenericFromText(input.provider, input.sourceFile, input.rawContent);
}

export function parseGenericFromJson(
  provider: ChatImportProvider,
  sourceFile: string,
  parsedJson: unknown
): ImportedChat[] {
  const candidates = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
  const chats: ImportedChat[] = [];

  candidates.forEach((candidate, index) => {
    const chat = coerceChatCandidate(provider, sourceFile, candidate, index + 1);
    if (chat !== null) {
      chats.push(chat);
    }
  });

  return chats;
}

export function parseGenericFromText(
  provider: ChatImportProvider,
  sourceFile: string,
  rawContent: string
): ImportedChat[] {
  const lines = rawContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const messages: ImportedMessage[] = [];
  let currentRole: ImportedMessageRole = "unknown";
  let currentParts: string[] = [];

  const flushCurrent = (): void => {
    if (currentParts.length === 0) {
      return;
    }

    messages.push({
      role: currentRole,
      content: currentParts.join("\n").trim()
    });
    currentParts = [];
  };

  lines.forEach((line) => {
    const roleMatch = /^(user|assistant|system|tool)\s*:\s*(.*)$/i.exec(line);
    if (roleMatch !== null) {
      flushCurrent();
      currentRole = normalizeRole(roleMatch[1] ?? "unknown");
      const firstLine = roleMatch[2]?.trim() ?? "";
      currentParts = firstLine.length > 0 ? [firstLine] : [];
      return;
    }

    currentParts.push(line);
  });

  flushCurrent();

  if (messages.length === 0) {
    messages.push({
      role: "unknown",
      content: lines.join("\n")
    });
  }

  return [
    {
      provider,
      sourceFile,
      topic: basename(sourceFile, extname(sourceFile)),
      messages
    }
  ];
}

function coerceChatCandidate(
  provider: ChatImportProvider,
  sourceFile: string,
  candidate: unknown,
  index: number
): ImportedChat | null {
  if (!isRecord(candidate)) {
    return null;
  }

  const topic =
    pickString(candidate, ["title", "topic", "subject", "name"]) ??
    `${basename(sourceFile, extname(sourceFile))}-${index}`;

  const messageCandidates = pickMessagesArray(candidate);
  const messages = messageCandidates
    .map((messageCandidate) => coerceMessageCandidate(messageCandidate))
    .filter((message): message is ImportedMessage => message !== null);

  if (messages.length === 0) {
    return null;
  }

  return {
    provider,
    sourceFile,
    topic,
    messages
  };
}

export function coerceMessageCandidate(candidate: unknown): ImportedMessage | null {
  if (typeof candidate === "string") {
    const content = candidate.trim();
    if (content.length === 0) {
      return null;
    }

    return {
      role: "unknown",
      content
    };
  }

  if (!isRecord(candidate)) {
    return null;
  }

  const role = normalizeRole(
    pickString(candidate, ["role", "author", "sender", "speaker", "type"]) ?? "unknown"
  );
  const content = extractMessageContent(candidate);
  if (content.length === 0) {
    return null;
  }

  const timestamp =
    pickString(candidate, ["timestamp", "created_at", "create_time", "time", "date"]) ??
    coerceNumberToString(candidate.create_time);

  return {
    role,
    content,
    ...(timestamp !== undefined ? { timestamp } : {})
  };
}

function extractMessageContent(candidate: Record<string, unknown>): string {
  const directContent = pickString(candidate, ["content", "text", "message", "body"]);
  if (directContent !== undefined) {
    return directContent.trim();
  }

  const contentValue = candidate.content;
  if (Array.isArray(contentValue)) {
    return contentValue
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter((part) => part.length > 0)
      .join("\n");
  }

  if (isRecord(contentValue)) {
    const parts = contentValue.parts;
    if (Array.isArray(parts)) {
      return parts
        .map((part) => (typeof part === "string" ? part.trim() : ""))
        .filter((part) => part.length > 0)
        .join("\n");
    }

    const text = pickString(contentValue, ["text", "value"]);
    if (text !== undefined) {
      return text.trim();
    }
  }

  return "";
}

function pickMessagesArray(candidate: Record<string, unknown>): unknown[] {
  const keys = ["messages", "chat_messages", "conversation", "items"];

  for (const key of keys) {
    const value = candidate[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function pickString(candidate: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = candidate[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function coerceNumberToString(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value * 1000).toISOString();
  }

  return undefined;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeRole(value: string): ImportedMessageRole {
  const normalized = value.toLowerCase();
  if ((CHAT_MESSAGE_ROLES as readonly string[]).includes(normalized)) {
    return normalized as ImportedMessageRole;
  }

  if (normalized.includes("assistant")) {
    return "assistant";
  }
  if (normalized.includes("user") || normalized.includes("human")) {
    return "user";
  }
  if (normalized.includes("system")) {
    return "system";
  }
  if (normalized.includes("tool")) {
    return "tool";
  }

  return "unknown";
}
