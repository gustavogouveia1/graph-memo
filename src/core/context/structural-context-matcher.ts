import type { IndexedFile } from "../indexing/indexed-file";
import type { QueryMatchOptions } from "../query/basic-relations";
import type { LocalIndexQueryLayer } from "../query/local-index-query-layer";
import type { ContextBuildFilters, StructuralContextResult } from "./context-types";

interface StructuralMatcherInput {
  task: string;
  terms: string[];
  filters: ContextBuildFilters;
  files: IndexedFile[];
  queryLayer: LocalIndexQueryLayer;
  matchOptions: QueryMatchOptions;
  maxFiles: number;
  maxSymbols: number;
  maxModules: number;
  maxRelations: number;
}

interface ScoredEntry {
  value: string;
  score: number;
}

const DEFAULT_FILE_SCORE = 3;
const DEFAULT_SYMBOL_SCORE = 5;
const DEFAULT_MODULE_SCORE = 4;
const FILTER_BONUS_SCORE = 6;

export function buildStructuralContext(input: StructuralMatcherInput): StructuralContextResult {
  const fileScores = new Map<string, number>();
  const symbolScores = new Map<string, number>();
  const moduleScores = new Map<string, number>();

  const effectiveTerms = collectEffectiveTerms(input.terms, input.filters);

  for (const term of effectiveTerms) {
    const filesBySymbol = input.queryLayer.findFilesBySymbol(term, {
      ...input.matchOptions,
      exactMatch: false
    });
    for (const filePath of filesBySymbol) {
      bumpScore(fileScores, filePath, DEFAULT_SYMBOL_SCORE);
    }

    const exportsBySymbol = input.queryLayer.findExportsBySymbol(term, {
      ...input.matchOptions,
      exactMatch: false
    });
    for (const exportMatch of exportsBySymbol) {
      const symbolName = exportMatch.exportEntry.exportedAs ?? exportMatch.exportEntry.name;
      bumpScore(symbolScores, symbolName, DEFAULT_SYMBOL_SCORE);
      bumpScore(fileScores, exportMatch.filePath, DEFAULT_SYMBOL_SCORE);
    }

    const filesByModule = input.queryLayer.findFilesImportingModule(term, {
      ...input.matchOptions,
      exactMatch: false
    });
    for (const filePath of filesByModule) {
      bumpScore(fileScores, filePath, DEFAULT_MODULE_SCORE);
      for (const moduleName of collectModulesFromFile(input.queryLayer, filePath, term, input.matchOptions)) {
        bumpScore(moduleScores, moduleName, DEFAULT_MODULE_SCORE);
      }
    }

    for (const file of input.files) {
      if (matchesText(file.relativePath, term, input.matchOptions, false)) {
        bumpScore(fileScores, file.relativePath, DEFAULT_FILE_SCORE);
      }

      for (const symbol of file.symbols) {
        if (matchesText(symbol.name, term, input.matchOptions, false)) {
          bumpScore(symbolScores, symbol.name, DEFAULT_SYMBOL_SCORE);
          bumpScore(fileScores, file.relativePath, DEFAULT_SYMBOL_SCORE);
        }
      }

      for (const importEntry of file.imports) {
        if (matchesText(importEntry.source, term, input.matchOptions, false)) {
          bumpScore(moduleScores, importEntry.source, DEFAULT_MODULE_SCORE);
          bumpScore(fileScores, file.relativePath, DEFAULT_MODULE_SCORE);
        }
      }
    }
  }

  applyExplicitFilterBoosts(input.filters, input.queryLayer, input.matchOptions, fileScores, symbolScores, moduleScores);

  const relevantFiles = sortAndLimitScores(fileScores, input.maxFiles).map((entry) => entry.value);
  const relevantSymbols = sortAndLimitScores(symbolScores, input.maxSymbols).map((entry) => entry.value);
  const relevantModules = sortAndLimitScores(moduleScores, input.maxModules).map((entry) => entry.value);
  const fileRelations = relevantFiles.slice(0, input.maxRelations).flatMap((filePath) => {
    const related = input.queryLayer.findFilesRelatedByImportExport(filePath);
    if (related === null) {
      return [];
    }

    return [
      {
        filePath: related.relativePath,
        dependsOn: related.dependsOn,
        importedBy: related.importedBy
      }
    ];
  });

  return {
    task: input.task,
    extractedTerms: input.terms,
    relevantFiles,
    relevantSymbols,
    relevantModules,
    fileRelations
  };
}

function collectEffectiveTerms(terms: string[], filters: ContextBuildFilters): string[] {
  const unique = new Set(terms);

  if (filters.symbol !== undefined) {
    unique.add(filters.symbol);
  }
  if (filters.file !== undefined) {
    unique.add(filters.file);
  }
  if (filters.moduleSource !== undefined) {
    unique.add(filters.moduleSource);
  }

  return [...unique];
}

function collectModulesFromFile(
  queryLayer: LocalIndexQueryLayer,
  filePath: string,
  term: string,
  matchOptions: QueryMatchOptions
): string[] {
  const details = queryLayer.getFileDetails(filePath);
  if (details === null) {
    return [];
  }

  const result = details.imports
    .filter((entry) => matchesText(entry.source, term, matchOptions, false))
    .map((entry) => entry.source);

  return dedupeAndSort(result);
}

function applyExplicitFilterBoosts(
  filters: ContextBuildFilters,
  queryLayer: LocalIndexQueryLayer,
  matchOptions: QueryMatchOptions,
  fileScores: Map<string, number>,
  symbolScores: Map<string, number>,
  moduleScores: Map<string, number>
): void {
  if (filters.symbol !== undefined) {
    const matchedFiles = queryLayer.findFilesBySymbol(filters.symbol, {
      ...matchOptions,
      exactMatch: true
    });
    for (const filePath of matchedFiles) {
      bumpScore(fileScores, filePath, FILTER_BONUS_SCORE);
      const related = queryLayer.findFilesRelatedByImportExport(filePath);
      if (related !== null) {
        for (const importedByPath of related.importedBy) {
          bumpScore(fileScores, importedByPath, DEFAULT_MODULE_SCORE);
        }
      }
    }
    bumpScore(symbolScores, filters.symbol, FILTER_BONUS_SCORE);
  }

  if (filters.file !== undefined) {
    bumpScore(fileScores, filters.file, FILTER_BONUS_SCORE);
  }

  if (filters.moduleSource !== undefined) {
    const matchedFiles = queryLayer.findFilesImportingModule(filters.moduleSource, {
      ...matchOptions,
      exactMatch: true
    });
    for (const filePath of matchedFiles) {
      bumpScore(fileScores, filePath, FILTER_BONUS_SCORE);
      const related = queryLayer.findFilesRelatedByImportExport(filePath);
      if (related !== null) {
        for (const dependsOnPath of related.dependsOn) {
          bumpScore(fileScores, dependsOnPath, DEFAULT_FILE_SCORE);
        }
      }
    }
    bumpScore(moduleScores, filters.moduleSource, FILTER_BONUS_SCORE);
  }
}

function bumpScore(map: Map<string, number>, key: string, amount: number): void {
  const current = map.get(key) ?? 0;
  map.set(key, current + amount);
}

function sortAndLimitScores(scores: Map<string, number>, limit: number): ScoredEntry[] {
  return [...scores.entries()]
    .map(([value, score]) => ({ value, score }))
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }

      return left.value.localeCompare(right.value);
    })
    .slice(0, limit);
}

function dedupeAndSort(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function matchesText(
  candidate: string,
  query: string,
  options: QueryMatchOptions,
  exactMatchOverride?: boolean
): boolean {
  const exactMatch = exactMatchOverride ?? options.exactMatch ?? true;
  const caseSensitive = options.caseSensitive ?? true;

  const normalizedCandidate = caseSensitive ? candidate : candidate.toLowerCase();
  const normalizedQuery = caseSensitive ? query : query.toLowerCase();

  if (exactMatch) {
    return normalizedCandidate === normalizedQuery;
  }

  return normalizedCandidate.includes(normalizedQuery);
}
