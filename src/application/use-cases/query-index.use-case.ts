import { resolve } from "node:path";

import type { IndexQueryReaderPort } from "../ports/index-query-reader";
import type { Logger } from "../ports/logger";
import { GraphMemoError } from "../../core/errors/graphmemo-error";
import { LocalIndexQueryLayer } from "../../core/query/local-index-query-layer";
import type { QueryMatchOptions } from "../../core/query/basic-relations";
import type { TaskExecution } from "../../core/tasks/task-execution";

export interface QueryIndexInput {
  targetPath: string;
  symbol?: string;
  file?: string;
  moduleSource?: string;
  relatedTo?: string;
  listFiles: boolean;
  caseSensitive: boolean;
  exactMatch: boolean;
}

interface QueryIndexDetails {
  rootPath: string;
  indexedFilesCount: number;
  appliedFilters: string[];
  filesBySymbol?: string[];
  exportsBySymbol?: Array<{ filePath: string; exportName: string; kind: string }>;
  fileDetails?: ReturnType<LocalIndexQueryLayer["getFileDetails"]>;
  filesImportingModule?: string[];
  relatedFiles?: ReturnType<LocalIndexQueryLayer["findFilesRelatedByImportExport"]>;
  indexedFiles?: string[];
}

export class QueryIndexUseCase {
  constructor(
    private readonly logger: Logger,
    private readonly queryReader: IndexQueryReaderPort
  ) {}

  async execute(input: QueryIndexInput): Promise<TaskExecution> {
    this.ensureAtLeastOneFilter(input);

    const rootPath = resolve(input.targetPath);
    this.logger.info("Executando consulta no indice local", {
      rootPath,
      correlationId: "query-local"
    });

    try {
      const storedIndex = await this.queryReader.read(rootPath);
      const queryLayer = new LocalIndexQueryLayer(storedIndex.files);
      const matchOptions: QueryMatchOptions = {
        caseSensitive: input.caseSensitive,
        exactMatch: input.exactMatch
      };

      const details: QueryIndexDetails = {
        rootPath,
        indexedFilesCount: storedIndex.manifest.indexedFilesCount,
        appliedFilters: []
      };

      if (input.symbol !== undefined) {
        details.appliedFilters.push("symbol");
        details.filesBySymbol = queryLayer.findFilesBySymbol(input.symbol, matchOptions);
        details.exportsBySymbol = queryLayer.findExportsBySymbol(input.symbol, matchOptions).map((entry) => ({
          filePath: entry.filePath,
          exportName: entry.exportEntry.exportedAs ?? entry.exportEntry.name,
          kind: entry.exportEntry.kind
        }));
      }

      if (input.file !== undefined) {
        details.appliedFilters.push("file");
        details.fileDetails = queryLayer.getFileDetails(input.file);
      }

      if (input.moduleSource !== undefined) {
        details.appliedFilters.push("module");
        details.filesImportingModule = queryLayer.findFilesImportingModule(input.moduleSource, matchOptions);
      }

      if (input.relatedTo !== undefined) {
        details.appliedFilters.push("related");
        details.relatedFiles = queryLayer.findFilesRelatedByImportExport(input.relatedTo);
      }

      if (input.listFiles) {
        details.appliedFilters.push("list-files");
        details.indexedFiles = queryLayer.listIndexedFiles();
      }

      const totalMatches = this.countTotalMatches(details);
      return {
        kind: "query",
        status: "success",
        message: `Consulta concluida com ${totalMatches} resultado(s).`,
        details
      };
    } catch (error: unknown) {
      if (error instanceof GraphMemoError) {
        throw error;
      }

      this.logger.error("Falha inesperada durante consulta do indice", {
        rootPath,
        correlationId: "query-local",
        error: error instanceof Error ? error.message : "erro-desconhecido"
      });

      throw new GraphMemoError(
        "QUERY_FAILED",
        "Falha ao consultar o indice local.",
        error,
        { rootPath }
      );
    }
  }

  private ensureAtLeastOneFilter(input: QueryIndexInput): void {
    const hasAnyFilter =
      input.symbol !== undefined ||
      input.file !== undefined ||
      input.moduleSource !== undefined ||
      input.relatedTo !== undefined ||
      input.listFiles;

    if (!hasAnyFilter) {
      throw new GraphMemoError(
        "QUERY_INVALID_INPUT",
        "Informe ao menos um filtro de consulta: --symbol, --file, --module, --related-to ou --list-files."
      );
    }
  }

  private countTotalMatches(details: QueryIndexDetails): number {
    return (
      (details.filesBySymbol?.length ?? 0) +
      (details.exportsBySymbol?.length ?? 0) +
      (details.filesImportingModule?.length ?? 0) +
      (details.indexedFiles?.length ?? 0) +
      (details.relatedFiles === null ? 0 : details.relatedFiles === undefined ? 0 : 1) +
      (details.fileDetails === null ? 0 : details.fileDetails === undefined ? 0 : 1)
    );
  }
}
