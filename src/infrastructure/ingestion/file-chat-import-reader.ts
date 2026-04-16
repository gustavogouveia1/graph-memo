import { readdir, readFile, stat } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

import type {
  ChatImportReadInput,
  ChatImportReadResult,
  ChatImportReaderPort
} from "../../application/ports/chat-import-reader";
import type { ImportedChat } from "../../core/chat-import/imported-chat";
import { GraphMemoError } from "../../core/errors/graphmemo-error";
import type { ChatImportProvider } from "../../core/chat-import/chat-import-provider";
import { ClaudeChatImportReader } from "./readers/claude-chat-import-reader";
import { CursorChatImportReader } from "./readers/cursor-chat-import-reader";
import { GenericChatImportReader } from "./readers/generic-chat-import-reader";
import { ChatGptChatImportReader } from "./readers/chatgpt-chat-import-reader";
import type { ProviderReader, ReaderParseInput } from "./readers/parsing-helpers";

const SUPPORTED_CHAT_EXTENSIONS = new Set([".json", ".jsonl", ".txt", ".md"]);

export class FileChatImportReader implements ChatImportReaderPort {
  private readonly genericReader: ProviderReader;
  private readonly providerReaders: Record<Exclude<ChatImportProvider, "generic">, ProviderReader>;

  constructor() {
    this.genericReader = new GenericChatImportReader();
    this.providerReaders = {
      claude: new ClaudeChatImportReader(),
      cursor: new CursorChatImportReader(),
      chatgpt: new ChatGptChatImportReader()
    };
  }

  async read(input: ChatImportReadInput): Promise<ChatImportReadResult> {
    const sourcePath = resolve(input.sourcePath);
    const sourceStats = await this.readSourceStats(sourcePath);
    const absoluteFiles = sourceStats.isDirectory()
      ? await this.listChatFilesRecursively(sourcePath)
      : [sourcePath];

    const chats: ImportedChat[] = [];
    let parsedFilesCount = 0;
    let fallbackFilesCount = 0;

    for (const absoluteFilePath of absoluteFiles) {
      const rawContent = await readFile(absoluteFilePath, "utf8");
      const sourceFile = this.normalizePath(relative(process.cwd(), absoluteFilePath));
      const parseInput: ReaderParseInput = {
        provider: input.provider,
        sourceFile,
        rawContent
      };

      const parsedFromProvider = this.parseWithProvider(parseInput);
      if (parsedFromProvider.length > 0) {
        chats.push(...parsedFromProvider);
        parsedFilesCount += 1;
        continue;
      }

      const parsedWithFallback = this.genericReader.parse(parseInput);
      if (parsedWithFallback.length > 0) {
        chats.push(...parsedWithFallback);
        parsedFilesCount += 1;
        fallbackFilesCount += 1;
      }
    }

    return {
      chats,
      scannedFilesCount: absoluteFiles.length,
      parsedFilesCount,
      fallbackFilesCount
    };
  }

  private parseWithProvider(input: ReaderParseInput) {
    if (input.provider === "generic") {
      return this.genericReader.parse(input);
    }

    const providerReader = this.providerReaders[input.provider as Exclude<ChatImportProvider, "generic">];
    return providerReader.parse(input);
  }

  private async readSourceStats(sourcePath: string) {
    try {
      return await stat(sourcePath);
    } catch (error: unknown) {
      throw new GraphMemoError(
        "CHAT_SOURCE_NOT_FOUND",
        "Origem de importacao nao encontrada. Verifique o caminho informado em --source.",
        error,
        { sourcePath }
      );
    }
  }

  private async listChatFilesRecursively(rootPath: string): Promise<string[]> {
    const result: string[] = [];
    await this.walk(rootPath, result);
    result.sort((left, right) => left.localeCompare(right));
    return result;
  }

  private async walk(currentPath: string, result: string[]): Promise<void> {
    const entries = await readdir(currentPath, { withFileTypes: true });
    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = resolve(currentPath, entry.name);
        if (entry.isDirectory()) {
          await this.walk(fullPath, result);
          return;
        }

        if (!entry.isFile()) {
          return;
        }

        const extension = extname(entry.name).toLowerCase();
        if (!SUPPORTED_CHAT_EXTENSIONS.has(extension)) {
          return;
        }

        result.push(fullPath);
      })
    );
  }

  private normalizePath(value: string): string {
    return value.split("\\").join("/");
  }
}
