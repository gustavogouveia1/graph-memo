import { createHash } from "node:crypto";
import { extname, relative, resolve } from "node:path";

import type { FileSystemPort } from "../ports/file-system";
import type { IndexStorePort, StoredIndex } from "../ports/index-store";
import type { Logger } from "../ports/logger";
import type { SourceCodeParserPort } from "../ports/source-code-parser";
import { GraphMemoError } from "../../core/errors/graphmemo-error";
import type { IndexedFile } from "../../core/indexing/indexed-file";
import type { TaskExecution } from "../../core/tasks/task-execution";

export interface RunIndexInput {
  targetPath: string;
  fullReindex: boolean;
  dryRun: boolean;
}

interface RunIndexSummary {
  rootPath: string;
  indexedFilesCount: number;
  reusedFilesCount: number;
  parsedFilesCount: number;
  supportedExtensions: string[];
  outputDirectory: string;
  incremental: boolean;
  dryRun: boolean;
}

export const SUPPORTED_INDEX_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"] as const;
export const IGNORED_INDEX_DIRECTORIES = [
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".git",
  ".graphmemo"
] as const;

export class RunIndexUseCase {
  constructor(
    private readonly logger: Logger,
    private readonly fileSystem: FileSystemPort,
    private readonly sourceCodeParser: SourceCodeParserPort,
    private readonly indexStore: IndexStorePort
  ) {}

  async execute(input: RunIndexInput): Promise<TaskExecution> {
    const rootPath = resolve(input.targetPath);

    this.logger.info("Iniciando indexacao local", {
      targetPath: input.targetPath,
      rootPath,
      fullReindex: input.fullReindex,
      dryRun: input.dryRun,
      correlationId: "index-local"
    });

    try {
      const previousIndex = input.fullReindex ? null : await this.indexStore.load(rootPath);
      const previousByPath = this.createPreviousFileMap(previousIndex);
      const absoluteFilePaths = await this.fileSystem.listFilesRecursively(
        rootPath,
        [...IGNORED_INDEX_DIRECTORIES]
      );

      const indexedFiles: IndexedFile[] = [];
      let reusedFilesCount = 0;
      let parsedFilesCount = 0;

      for (const absoluteFilePath of absoluteFilePaths) {
        const extension = extname(absoluteFilePath).toLowerCase();

        if (!SUPPORTED_INDEX_EXTENSIONS.includes(extension as (typeof SUPPORTED_INDEX_EXTENSIONS)[number])) {
          continue;
        }

        const relativePath = this.normalizeRelativePath(relative(rootPath, absoluteFilePath));
        const metadata = await this.fileSystem.getFileMetadata(absoluteFilePath);
        const previous = previousByPath.get(relativePath);

        if (
          previous !== undefined &&
          previous.size === metadata.size &&
          previous.mtimeMs === metadata.mtimeMs
        ) {
          indexedFiles.push(previous);
          reusedFilesCount += 1;
          continue;
        }

        const fileBuffer = await this.fileSystem.readFileBuffer(absoluteFilePath);
        const hash = createHash("sha256").update(fileBuffer).digest("hex");

        if (previous !== undefined && previous.hash === hash) {
          indexedFiles.push({
            ...previous,
            size: metadata.size,
            mtimeMs: metadata.mtimeMs
          });
          reusedFilesCount += 1;
          continue;
        }

        const parsed = this.sourceCodeParser.parse(absoluteFilePath, fileBuffer.toString("utf8"));
        indexedFiles.push({
          relativePath,
          extension,
          size: metadata.size,
          mtimeMs: metadata.mtimeMs,
          hash,
          imports: parsed.imports,
          exports: parsed.exports,
          symbols: parsed.symbols
        });
        parsedFilesCount += 1;
      }

      indexedFiles.sort((left, right) => left.relativePath.localeCompare(right.relativePath));

      const summary: RunIndexSummary = {
        rootPath,
        indexedFilesCount: indexedFiles.length,
        reusedFilesCount,
        parsedFilesCount,
        supportedExtensions: [...SUPPORTED_INDEX_EXTENSIONS],
        outputDirectory: ".graphmemo",
        incremental: !input.fullReindex,
        dryRun: input.dryRun
      };

      if (!input.dryRun) {
        await this.indexStore.save(rootPath, {
          manifest: {
            schemaVersion: "1",
            generatedAt: new Date().toISOString(),
            rootPath,
            indexedFilesCount: indexedFiles.length,
            supportedExtensions: [...SUPPORTED_INDEX_EXTENSIONS]
          },
          files: indexedFiles
        });
      }

      this.logger.info("Indexacao concluida", {
        ...summary,
        correlationId: "index-local"
      });

      return {
        kind: "index",
        status: "success",
        message: this.buildSuccessMessage(summary),
        details: summary
      };
    } catch (error: unknown) {
      this.logger.error("Falha na indexacao local", {
        rootPath,
        correlationId: "index-local",
        error: error instanceof Error ? error.message : "erro-desconhecido"
      });

      throw new GraphMemoError(
        "INDEX_FAILED",
        "Falha ao indexar o diretorio alvo. Verifique o caminho e as permissoes de leitura/escrita.",
        error,
        { rootPath }
      );
    }
  }

  private createPreviousFileMap(previous: StoredIndex | null): Map<string, IndexedFile> {
    if (previous === null) {
      return new Map<string, IndexedFile>();
    }

    return new Map(previous.files.map((file) => [file.relativePath, file]));
  }

  private normalizeRelativePath(value: string): string {
    return value.split("\\").join("/");
  }

  private buildSuccessMessage(summary: RunIndexSummary): string {
    const mode = summary.incremental ? "incremental" : "full";
    const persistence = summary.dryRun ? "sem persistencia (--dry-run)" : "persistido em .graphmemo/";

    return `Indexacao ${mode} concluida: ${summary.indexedFilesCount} arquivo(s), ${summary.parsedFilesCount} parseado(s), ${summary.reusedFilesCount} reaproveitado(s), ${persistence}.`;
  }
}
