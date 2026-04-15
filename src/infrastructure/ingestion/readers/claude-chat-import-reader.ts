import { basename, extname } from "node:path";

import type { ImportedChat } from "../../../core/chat-import/imported-chat";
import type { ImportedMessage } from "../../../core/chat-import/imported-message";
import type { ProviderReader, ReaderParseInput } from "./parsing-helpers";
import { coerceMessageCandidate, isRecord, normalizeRole, parseAsJson } from "./parsing-helpers";

export class ClaudeChatImportReader implements ProviderReader {
  parse(input: ReaderParseInput): ImportedChat[] {
    const parsedJson = parseAsJson(input.rawContent);
    if (parsedJson === null) {
      return [];
    }

    const candidates = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
    const chats: ImportedChat[] = [];

    candidates.forEach((candidate, index) => {
      const chat = this.parseCandidate(candidate, input.sourceFile, index + 1);
      if (chat !== null) {
        chats.push(chat);
      }
    });

    return chats;
  }

  private parseCandidate(candidate: unknown, sourceFile: string, index: number): ImportedChat | null {
    if (!isRecord(candidate)) {
      return null;
    }

    const rawMessages = this.pickMessages(candidate);
    const messages = rawMessages
      .map((rawMessage) => this.coerceClaudeMessage(rawMessage))
      .filter((message): message is ImportedMessage => message !== null);

    if (messages.length === 0) {
      return null;
    }

    const topic = this.pickTopic(candidate, sourceFile, index);

    return {
      provider: "claude",
      sourceFile,
      topic,
      messages
    };
  }

  private pickMessages(candidate: Record<string, unknown>): unknown[] {
    const keys = ["chat_messages", "messages", "conversation"];
    for (const key of keys) {
      const value = candidate[key];
      if (Array.isArray(value)) {
        return value;
      }
    }

    return [];
  }

  private coerceClaudeMessage(candidate: unknown): ImportedMessage | null {
    if (isRecord(candidate)) {
      const sender = typeof candidate.sender === "string" ? candidate.sender : undefined;
      const fallback = coerceMessageCandidate(candidate);
      if (fallback === null) {
        return null;
      }

      return {
        role: sender === undefined ? fallback.role : normalizeRole(sender),
        content: fallback.content,
        ...(fallback.timestamp !== undefined ? { timestamp: fallback.timestamp } : {})
      };
    }

    return coerceMessageCandidate(candidate);
  }

  private pickTopic(candidate: Record<string, unknown>, sourceFile: string, index: number): string {
    const keys = ["name", "title", "topic", "subject"];
    for (const key of keys) {
      const value = candidate[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
    }

    return `${basename(sourceFile, extname(sourceFile))}-${index}`;
  }
}
