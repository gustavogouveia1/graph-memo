import type { ImportedChat } from "../../../core/chat-import/imported-chat";
import type { ImportedMessage } from "../../../core/chat-import/imported-message";
import type { ProviderReader, ReaderParseInput } from "./parsing-helpers";
import { coerceMessageCandidate, isRecord, normalizeRole, parseAsJson } from "./parsing-helpers";

export class ChatGptChatImportReader implements ProviderReader {
  parse(input: ReaderParseInput): ImportedChat[] {
    const parsedJson = parseAsJson(input.rawContent);
    if (parsedJson === null) {
      return [];
    }

    const candidates = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
    const chats: ImportedChat[] = [];

    candidates.forEach((candidate, index) => {
      const chat = this.parseChatCandidate(candidate, input.sourceFile, index + 1);
      if (chat !== null) {
        chats.push(chat);
      }
    });

    return chats;
  }

  private parseChatCandidate(
    candidate: unknown,
    sourceFile: string,
    index: number
  ): ImportedChat | null {
    if (!isRecord(candidate)) {
      return null;
    }

    const mapping = candidate.mapping;
    if (!isRecord(mapping)) {
      return null;
    }

    const entries = Object.values(mapping)
      .filter((entry): entry is Record<string, unknown> => isRecord(entry))
      .sort((left, right) => {
        const leftTime = this.readCreateTime(left);
        const rightTime = this.readCreateTime(right);
        return leftTime - rightTime;
      });

    const messages: ImportedMessage[] = entries
      .map((entry) => this.mapEntryToMessage(entry))
      .filter((message): message is ImportedMessage => message !== null);

    if (messages.length === 0) {
      return null;
    }

    const title = typeof candidate.title === "string" ? candidate.title.trim() : "";

    return {
      provider: "chatgpt",
      sourceFile,
      topic: title.length > 0 ? title : `chatgpt-chat-${index}`,
      messages
    };
  }

  private mapEntryToMessage(entry: Record<string, unknown>): ImportedMessage | null {
    const message = entry.message;
    if (!isRecord(message)) {
      return null;
    }

    const author = message.author;
    const role =
      isRecord(author) && typeof author.role === "string" ? normalizeRole(author.role) : "unknown";

    const content = message.content;
    const text =
      isRecord(content) && Array.isArray(content.parts)
        ? content.parts
            .map((part) => (typeof part === "string" ? part.trim() : ""))
            .filter((part) => part.length > 0)
            .join("\n")
        : (() => {
            const fallback = coerceMessageCandidate(message);
            return fallback?.content ?? "";
          })();
    if (text.length === 0) {
      return null;
    }

    const createTime = this.readCreateTime(entry);

    return {
      role,
      content: text,
      ...(Number.isFinite(createTime) && createTime > 0
        ? { timestamp: new Date(createTime * 1000).toISOString() }
        : {})
    };
  }

  private readCreateTime(entry: Record<string, unknown>): number {
    const values = [entry.create_time, entry.update_time];
    for (const value of values) {
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
    }

    return Number.MAX_SAFE_INTEGER;
  }
}
