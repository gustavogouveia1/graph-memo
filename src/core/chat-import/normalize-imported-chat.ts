import { createHash } from "node:crypto";
import { basename, extname } from "node:path";

import type { ImportedChat } from "./imported-chat";
import type { ImportedMessage, ImportedMessageRole } from "./imported-message";
import type { NormalizedChatNote } from "./normalized-chat-note";

interface NormalizeImportedChatInput {
  chat: ImportedChat;
  importedAt: string;
  noteIndex: number;
}

export function normalizeImportedChat(input: NormalizeImportedChatInput): NormalizedChatNote {
  const topic = normalizeTopic(input.chat.topic, input.chat.sourceFile);
  const sourceBaseName = basename(input.chat.sourceFile, extname(input.chat.sourceFile));
  const datePrefix = input.importedAt.slice(0, 10);
  const stableHash = createHash("sha1")
    .update(`${input.chat.sourceFile}:${input.noteIndex}:${topic}`)
    .digest("hex")
    .slice(0, 8);

  const noteFileName = `${datePrefix}-${slugify(topic)}-${sourceBaseName}-${stableHash}.md`;
  const title = `Chat Import - ${datePrefix} - ${input.chat.provider} - ${topic}`;
  const tags = [
    "#import",
    `#provider/${input.chat.provider}`,
    "#status/new",
    "#domain/data",
    "#type/feature"
  ];
  const related = ["[[ADR-001]]", "[[Decision:Stack inicial da CLI Graph-Memo]]", "[[Feature:Ingestao de chats v1]]"];

  return {
    title,
    topic,
    provider: input.chat.provider,
    sourceFile: input.chat.sourceFile,
    importedAt: input.importedAt,
    tags,
    related,
    messages: input.chat.messages.map((message) => ({
      role: normalizeRole(message.role),
      content: message.content.trim(),
      ...(message.timestamp !== undefined ? { timestamp: message.timestamp } : {})
    })),
    noteFileName,
    noteContent: renderNote({
      title,
      provider: input.chat.provider,
      sourceFile: input.chat.sourceFile,
      importedAt: input.importedAt,
      topic,
      tags,
      related,
      messages: input.chat.messages
    })
  };
}

function renderNote(input: {
  title: string;
  provider: string;
  sourceFile: string;
  importedAt: string;
  topic: string;
  tags: string[];
  related: string[];
  messages: ImportedMessage[];
}): string {
  const formattedMessages =
    input.messages.length === 0
      ? "_Nenhuma mensagem valida encontrada no export._"
      : input.messages
          .map((message, index) => {
            const timestampSuffix = message.timestamp === undefined ? "" : ` (${message.timestamp})`;
            return `### ${index + 1}. ${normalizeRole(message.role)}${timestampSuffix}\n\n${message.content.trim()}\n`;
          })
          .join("\n");

  const tagsText = input.tags.join(" ");

  return [
    `# ${input.title}`,
    "",
    "## Metadata",
    `- provider: ${input.provider}`,
    `- imported_at: ${input.importedAt}`,
    `- source_file: ${input.sourceFile}`,
    `- topic: ${input.topic}`,
    `- message_count: ${input.messages.length}`,
    `- tags: ${tagsText}`,
    "",
    "## Messages",
    formattedMessages.trimEnd(),
    "",
    "## Related",
    ...input.related.map((link) => `- ${link}`),
    ""
  ].join("\n");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function normalizeTopic(topic: string, sourceFile: string): string {
  const trimmed = topic.trim();
  if (trimmed.length > 0) {
    return trimmed.slice(0, 120);
  }

  return basename(sourceFile, extname(sourceFile));
}

function normalizeRole(role: ImportedMessageRole): ImportedMessageRole {
  return role;
}
