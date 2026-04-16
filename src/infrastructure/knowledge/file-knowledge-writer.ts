import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type {
  KnowledgeWriteResult,
  KnowledgeWriterPort
} from "../../application/ports/knowledge-writer";
import type { NormalizedChatNote } from "../../core/chat-import/normalized-chat-note";

const IMPORTS_DIRECTORY = "imports";

export class FileKnowledgeWriter implements KnowledgeWriterPort {
  async writeChatNotes(
    rootPath: string,
    notes: NormalizedChatNote[]
  ): Promise<KnowledgeWriteResult[]> {
    const importsDirectoryPath = join(rootPath, IMPORTS_DIRECTORY);
    await mkdir(importsDirectoryPath, { recursive: true });

    const writes = notes.map(async (note) => {
      const notePath = join(importsDirectoryPath, note.noteFileName);
      await writeFile(notePath, note.noteContent, "utf8");

      return {
        relativePath: `imports/${note.noteFileName}`
      };
    });

    return Promise.all(writes);
  }
}
