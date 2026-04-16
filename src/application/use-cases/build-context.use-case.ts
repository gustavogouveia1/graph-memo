import { resolve } from "node:path";

import type { IndexQueryReaderPort } from "../ports/index-query-reader";
import type { KnowledgeContextReaderPort } from "../ports/knowledge-context-reader";
import type { Logger } from "../ports/logger";
import { buildContextPackage } from "../../core/context/context-package-builder";
import { formatBuiltContext, type ContextOutputFormat } from "../../core/context/context-output-formatter";
import type { BuiltContextPackage, ContextBuildFilters } from "../../core/context/context-types";
import { buildKnowledgeContext } from "../../core/context/knowledge-context-matcher";
import { buildStructuralContext } from "../../core/context/structural-context-matcher";
import { extractTaskTerms } from "../../core/context/task-term-extractor";
import { GraphMemoError } from "../../core/errors/graphmemo-error";
import { LocalIndexQueryLayer } from "../../core/query/local-index-query-layer";
import type { TaskExecution } from "../../core/tasks/task-execution";

export interface BuildContextInput {
  targetPath: string;
  task: string;
  format: ContextOutputFormat;
  symbol?: string;
  file?: string;
  moduleSource?: string;
  caseSensitive: boolean;
  exactMatch: boolean;
}

export class BuildContextUseCase {
  constructor(
    private readonly logger: Logger,
    private readonly indexQueryReader: IndexQueryReaderPort,
    private readonly knowledgeContextReader: KnowledgeContextReaderPort
  ) {}

  async execute(input: BuildContextInput): Promise<TaskExecution> {
    const task = input.task.trim();
    if (task.length === 0) {
      throw new GraphMemoError(
        "CONTEXT_INVALID_INPUT",
        "Task invalida. Informe uma descricao nao vazia em --task."
      );
    }
    if (input.format !== "markdown" && input.format !== "json") {
      throw new GraphMemoError(
        "CONTEXT_INVALID_INPUT",
        "Formato invalido. Use --format markdown ou --format json."
      );
    }

    if (input.symbol !== undefined && input.symbol.trim().length === 0) {
      throw new GraphMemoError(
        "CONTEXT_INVALID_INPUT",
        "Filtro invalido. O valor de --symbol nao pode ser vazio."
      );
    }
    if (input.file !== undefined && input.file.trim().length === 0) {
      throw new GraphMemoError(
        "CONTEXT_INVALID_INPUT",
        "Filtro invalido. O valor de --file nao pode ser vazio."
      );
    }
    if (input.moduleSource !== undefined && input.moduleSource.trim().length === 0) {
      throw new GraphMemoError(
        "CONTEXT_INVALID_INPUT",
        "Filtro invalido. O valor de --module nao pode ser vazio."
      );
    }

    const rootPath = resolve(input.targetPath);
    this.logger.info("Construindo contexto consolidado da task", {
      rootPath,
      format: input.format,
      correlationId: "context-build"
    });

    try {
      const [storedIndex, knowledgeDocuments] = await Promise.all([
        this.indexQueryReader.read(rootPath),
        this.knowledgeContextReader.readDocuments(rootPath)
      ]);
      const queryLayer = new LocalIndexQueryLayer(storedIndex.files);
      const filters: ContextBuildFilters = {};
      const extraTerms: string[] = [];

      if (input.symbol !== undefined) {
        filters.symbol = input.symbol;
        extraTerms.push(input.symbol);
      }
      if (input.file !== undefined) {
        filters.file = input.file;
        extraTerms.push(input.file);
      }
      if (input.moduleSource !== undefined) {
        filters.moduleSource = input.moduleSource;
        extraTerms.push(input.moduleSource);
      }

      const extractedTerms = extractTaskTerms(task, extraTerms);
      const structuralContext = buildStructuralContext({
        task,
        terms: extractedTerms,
        filters,
        files: storedIndex.files,
        queryLayer,
        matchOptions: {
          caseSensitive: input.caseSensitive,
          exactMatch: input.exactMatch
        },
        maxFiles: 10,
        maxSymbols: 10,
        maxModules: 10,
        maxRelations: 5
      });
      const knowledgeContext = buildKnowledgeContext({
        documents: knowledgeDocuments,
        structuralContext,
        maxKnowledgeNotes: 8,
        maxAdrsAndDocs: 8
      });
      const contextPackage = buildContextPackage({
        structuralContext,
        knowledgeContext,
        maxStartingPoints: 6
      });

      return {
        kind: "context",
        status: "success",
        message: this.buildSuccessMessage(contextPackage),
        details: this.toTaskDetails(contextPackage, input.format)
      };
    } catch (error: unknown) {
      if (error instanceof GraphMemoError) {
        throw error;
      }

      this.logger.error("Falha inesperada ao construir contexto", {
        rootPath,
        correlationId: "context-build",
        error: error instanceof Error ? error.message : "erro-desconhecido"
      });

      throw new GraphMemoError(
        "CONTEXT_BUILD_FAILED",
        "Falha ao construir contexto consolidado. Verifique se o indice local e os diretorios docs/knowledge estao acessiveis.",
        error,
        { rootPath }
      );
    }
  }

  private buildSuccessMessage(contextPackage: BuiltContextPackage): string {
    return `Contexto gerado com ${contextPackage.relevantFiles.length} arquivo(s), ${contextPackage.relevantSymbols.length} simbolo(s), ${contextPackage.relevantKnowledgeNotes.length} nota(s) e ${contextPackage.relevantAdrsAndDocs.length} ADR/doc(s).`;
  }

  private toTaskDetails(
    contextPackage: BuiltContextPackage,
    format: ContextOutputFormat
  ): BuiltContextPackage | string {
    if (format === "json") {
      return contextPackage;
    }

    return formatBuiltContext(contextPackage, "markdown");
  }
}
