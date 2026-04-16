import { basename, extname } from "node:path";

import type { ImportedChat } from "../../../core/chat-import/imported-chat";
import type { ImportedMessage } from "../../../core/chat-import/imported-message";
import type { ProviderReader, ReaderParseInput } from "./parsing-helpers";
import { coerceMessageCandidate, isRecord, normalizeRole, parseAsJson } from "./parsing-helpers";

export class CursorChatImportReader implements ProviderReader {
  parse(input: ReaderParseInput): ImportedChat[] {
    const jsonChats = this.parseFromJson(input);
    if (jsonChats.length > 0) {
      return jsonChats;
    }

    return this.parseFromJsonLines(input);
  }

  private parseFromJson(input: ReaderParseInput): ImportedChat[] {
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

  private parseFromJsonLines(input: ReaderParseInput): ImportedChat[] {
    const lines = input.rawContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return [];
    }

    const messages: ImportedMessage[] = [];
    lines.forEach((line) => {
      const parsed = parseAsJson(line);
      if (!isRecord(parsed)) {
        return;
      }

      const message = coerceMessageCandidate(parsed);
      if (message !== null) {
        messages.push(message);
      }
    });

    if (messages.length === 0) {
      return [];
    }

    return [
      {
        provider: "cursor",
        sourceFile: input.sourceFile,
        topic: basename(input.sourceFile, extname(input.sourceFile)),
        messages
      }
    ];
  }

  private parseCandidate(
    candidate: unknown,
    sourceFile: string,
    index: number
  ): ImportedChat | null {
    if (!isRecord(candidate)) {
      return null;
    }

    const rawMessages = this.pickMessages(candidate);
    const messages = rawMessages
      .map((rawMessage) => this.coerceCursorMessage(rawMessage))
      .filter((message): message is ImportedMessage => message !== null);

    if (messages.length === 0) {
      return null;
    }

    const title =
      (typeof candidate.title === "string" && candidate.title.trim()) ||
      (typeof candidate.name === "string" && candidate.name.trim()) ||
      `${basename(sourceFile, extname(sourceFile))}-${index}`;

    return {
      provider: "cursor",
      sourceFile,
      topic: title,
      messages
    };
  }

  private pickMessages(candidate: Record<string, unknown>): unknown[] {
    const keys = ["messages", "chat", "conversation", "items", "turns"];
    for (const key of keys) {
      const value = candidate[key];
      if (Array.isArray(value)) {
        return value;
      }
    }

    return [];
  }

  private coerceCursorMessage(candidate: unknown): ImportedMessage | null {
    if (!isRecord(candidate)) {
      return coerceMessageCandidate(candidate);
    }

    const roleValue = typeof candidate.type === "string" ? candidate.type : candidate.role;
    const fallback = coerceMessageCandidate(candidate);
    if (fallback === null) {
      return null;
    }

    if (typeof roleValue !== "string") {
      return fallback;
    }

    return {
      ...fallback,
      role: normalizeRole(roleValue)
    };
  }
}
