import { basename, extname } from "node:path";

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

interface FileScoreState {
  score: number;
  strongSignals: number;
  domainSignals: number;
  structuralSignals: number;
  weakSignals: number;
}

interface TermBuckets {
  domainTerms: string[];
  pathTerms: string[];
  weakTerms: string[];
}

const SCORE_EXACT_SYMBOL = 120;
const SCORE_EXACT_PATH = 100;
const SCORE_EXACT_FILE_NAME = 80;
const SCORE_EXACT_MODULE = 60;
const SCORE_STRUCTURAL_RELATION = 40;
const SCORE_STRONG_DOMAIN_TERM = 25;
const PENALTY_GENERIC_FILE = -30;
const PENALTY_WEAK_TOKEN_ONLY = -40;
const MAX_STRUCTURAL_ANCHORS = 4;

const STRONG_SHORT_TERMS = new Set(["csv", "api", "sql", "pdf", "xml", "jwt", "url"]);
const GENERIC_FILE_NAMES = new Set([
  "app.tsx",
  "app.ts",
  "dashboard.tsx",
  "dashboard.ts",
  "index.tsx",
  "index.ts",
  "main.tsx",
  "main.ts",
  "layout.tsx",
  "layout.ts",
  "clienteslist.tsx",
  "clienteslist.ts",
  "usuarioform.tsx",
  "usuarioform.ts",
  "themeprovider.tsx",
  "themeprovider.ts"
]);

export function buildStructuralContext(input: StructuralMatcherInput): StructuralContextResult {
  const fileScores = new Map<string, FileScoreState>();
  const symbolScores = new Map<string, number>();
  const moduleScores = new Map<string, number>();
  const termBuckets = splitTerms(input.terms);

  if (input.filters.symbol !== undefined) {
    applyExactSymbolSignal(
      input.filters.symbol,
      input.queryLayer,
      input.matchOptions,
      fileScores,
      symbolScores
    );
  }
  if (input.filters.file !== undefined) {
    applyExactPathSignal(input.filters.file, input.files, fileScores);
    applyExactFileNameSignal(input.filters.file, input.files, fileScores);
  }
  if (input.filters.moduleSource !== undefined) {
    applyExactModuleSignal(
      input.filters.moduleSource,
      input.queryLayer,
      input.matchOptions,
      fileScores,
      moduleScores
    );
  }

  for (const term of termBuckets.pathTerms) {
    applyExactPathSignal(term, input.files, fileScores);
    applyExactFileNameSignal(term, input.files, fileScores);
    applyDomainSignal(
      term,
      input.files,
      input.matchOptions,
      fileScores,
      symbolScores,
      moduleScores
    );
  }

  for (const term of termBuckets.domainTerms) {
    applyExactSymbolSignal(term, input.queryLayer, input.matchOptions, fileScores, symbolScores);
    applyExactFileNameSignal(term, input.files, fileScores);
    applyExactModuleSignal(term, input.queryLayer, input.matchOptions, fileScores, moduleScores);
    applyDomainSignal(
      term,
      input.files,
      input.matchOptions,
      fileScores,
      symbolScores,
      moduleScores
    );
  }

  for (const term of termBuckets.weakTerms) {
    applyWeakTokenTracking(term, input.files, input.matchOptions, fileScores);
  }

  applyStructuralRelationBoosts(fileScores, input.queryLayer, symbolScores, moduleScores);
  applyNoisePenalties(fileScores);

  const relevantFiles = sortAndLimitFileScores(fileScores, input.maxFiles).map(
    (entry) => entry.value
  );
  const relevantSymbols = sortAndLimitScores(symbolScores, input.maxSymbols).map(
    (entry) => entry.value
  );
  const relevantModules = sortAndLimitScores(moduleScores, input.maxModules).map(
    (entry) => entry.value
  );
  const relationSeedPaths = dedupeAndSort([
    ...relevantFiles.slice(0, input.maxRelations),
    ...extractStructuralAnchors(fileScores).slice(0, input.maxRelations)
  ]);
  const fileRelations = relationSeedPaths.slice(0, input.maxRelations).flatMap((filePath) => {
    const related = input.queryLayer.findFilesRelatedByImportExport(filePath);
    if (related === null) {
      return [];
    }

    const enrichedDependsOn = enrichOneHopDependencies(related.dependsOn, input.queryLayer);
    const enrichedImportedBy = enrichOneHopImporters(related.importedBy, input.queryLayer);
    if (enrichedDependsOn.length === 0 && enrichedImportedBy.length === 0) {
      return [];
    }

    return [
      {
        filePath: related.relativePath,
        dependsOn: enrichedDependsOn,
        importedBy: enrichedImportedBy
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

function splitTerms(terms: string[]): TermBuckets {
  const unique = dedupeAndSort(terms);
  const domainTerms: string[] = [];
  const pathTerms: string[] = [];
  const weakTerms: string[] = [];

  for (const term of unique) {
    if (isWeakToken(term)) {
      weakTerms.push(term);
      continue;
    }
    if (isPathLikeTerm(term)) {
      pathTerms.push(term);
      continue;
    }
    domainTerms.push(term);
  }

  return {
    domainTerms,
    pathTerms,
    weakTerms
  };
}

function applyExactSymbolSignal(
  term: string,
  queryLayer: LocalIndexQueryLayer,
  matchOptions: QueryMatchOptions,
  fileScores: Map<string, FileScoreState>,
  symbolScores: Map<string, number>
): void {
  const filesBySymbol = queryLayer.findFilesBySymbol(term, {
    ...matchOptions,
    exactMatch: true
  });
  for (const filePath of filesBySymbol) {
    bumpFileScore(fileScores, filePath, SCORE_EXACT_SYMBOL, "strong");
  }

  const exportsBySymbol = queryLayer.findExportsBySymbol(term, {
    ...matchOptions,
    exactMatch: true
  });
  for (const exportMatch of exportsBySymbol) {
    const symbolName = exportMatch.exportEntry.exportedAs ?? exportMatch.exportEntry.name;
    bumpScore(symbolScores, symbolName, SCORE_EXACT_SYMBOL);
    bumpFileScore(fileScores, exportMatch.filePath, SCORE_EXACT_SYMBOL, "strong");
  }

  bumpScore(symbolScores, term, SCORE_EXACT_SYMBOL);
}

function applyExactPathSignal(
  term: string,
  files: IndexedFile[],
  fileScores: Map<string, FileScoreState>
): void {
  for (const file of files) {
    if (isExactPathMatch(file.relativePath, term)) {
      bumpFileScore(fileScores, file.relativePath, SCORE_EXACT_PATH, "strong");
    }
  }
}

function applyExactFileNameSignal(
  term: string,
  files: IndexedFile[],
  fileScores: Map<string, FileScoreState>
): void {
  const normalizedTerm = normalizeString(term);
  for (const file of files) {
    const nameWithExtension = basename(file.relativePath).toLowerCase();
    const extensionlessName = stripKnownExtension(nameWithExtension);
    if (normalizedTerm === nameWithExtension || normalizedTerm === extensionlessName) {
      bumpFileScore(fileScores, file.relativePath, SCORE_EXACT_FILE_NAME, "strong");
    }
  }
}

function applyExactModuleSignal(
  term: string,
  queryLayer: LocalIndexQueryLayer,
  matchOptions: QueryMatchOptions,
  fileScores: Map<string, FileScoreState>,
  moduleScores: Map<string, number>
): void {
  const matchedFiles = queryLayer.findFilesImportingModule(term, {
    ...matchOptions,
    exactMatch: true
  });
  for (const filePath of matchedFiles) {
    bumpFileScore(fileScores, filePath, SCORE_EXACT_MODULE, "strong");
    const details = queryLayer.getFileDetails(filePath);
    if (details !== null) {
      for (const importEntry of details.imports) {
        if (matchesText(importEntry.source, term, matchOptions, true)) {
          bumpScore(moduleScores, importEntry.source, SCORE_EXACT_MODULE);
        }
      }
    }
  }
}

function applyDomainSignal(
  term: string,
  files: IndexedFile[],
  matchOptions: QueryMatchOptions,
  fileScores: Map<string, FileScoreState>,
  symbolScores: Map<string, number>,
  moduleScores: Map<string, number>
): void {
  for (const file of files) {
    let matchedInFile = false;
    if (matchesDomainTerm(file.relativePath, term, matchOptions)) {
      matchedInFile = true;
    }

    for (const symbol of file.symbols) {
      if (matchesDomainTerm(symbol.name, term, matchOptions)) {
        bumpScore(symbolScores, symbol.name, SCORE_STRONG_DOMAIN_TERM);
        matchedInFile = true;
      }
    }

    for (const exportEntry of file.exports) {
      const exportName = exportEntry.exportedAs ?? exportEntry.name;
      if (matchesDomainTerm(exportName, term, matchOptions)) {
        bumpScore(symbolScores, exportName, SCORE_STRONG_DOMAIN_TERM);
        matchedInFile = true;
      }
    }

    for (const importEntry of file.imports) {
      if (matchesDomainTerm(importEntry.source, term, matchOptions)) {
        bumpScore(moduleScores, importEntry.source, SCORE_STRONG_DOMAIN_TERM);
        matchedInFile = true;
      }
    }

    if (matchedInFile) {
      bumpFileScore(fileScores, file.relativePath, SCORE_STRONG_DOMAIN_TERM, "domain");
    }
  }
}

function applyWeakTokenTracking(
  term: string,
  files: IndexedFile[],
  matchOptions: QueryMatchOptions,
  fileScores: Map<string, FileScoreState>
): void {
  for (const file of files) {
    let weakMatch = matchesText(file.relativePath, term, matchOptions, false);
    if (!weakMatch) {
      weakMatch = file.symbols.some((symbol) =>
        matchesText(symbol.name, term, matchOptions, false)
      );
    }
    if (!weakMatch) {
      weakMatch = file.imports.some((entry) =>
        matchesText(entry.source, term, matchOptions, false)
      );
    }
    if (weakMatch) {
      bumpFileScore(fileScores, file.relativePath, 0, "weak");
    }
  }
}

function applyStructuralRelationBoosts(
  fileScores: Map<string, FileScoreState>,
  queryLayer: LocalIndexQueryLayer,
  symbolScores: Map<string, number>,
  moduleScores: Map<string, number>
): void {
  const anchors = extractStructuralAnchors(fileScores).slice(0, MAX_STRUCTURAL_ANCHORS);
  for (const anchor of anchors) {
    const related = queryLayer.findFilesRelatedByImportExport(anchor);
    if (related === null) {
      continue;
    }

    for (const dependentPath of related.dependsOn) {
      bumpFileScore(fileScores, dependentPath, SCORE_STRUCTURAL_RELATION, "structural");
      const details = queryLayer.getFileDetails(dependentPath);
      if (details !== null) {
        for (const symbol of details.symbols) {
          bumpScore(symbolScores, symbol.name, SCORE_STRUCTURAL_RELATION);
        }
      }
    }
    for (const importerPath of related.importedBy) {
      bumpFileScore(fileScores, importerPath, SCORE_STRUCTURAL_RELATION, "structural");
      const details = queryLayer.getFileDetails(importerPath);
      if (details !== null) {
        for (const importEntry of details.imports) {
          bumpScore(moduleScores, importEntry.source, SCORE_STRUCTURAL_RELATION);
        }
      }
    }
  }
}

function applyNoisePenalties(fileScores: Map<string, FileScoreState>): void {
  for (const [filePath, state] of fileScores.entries()) {
    if (
      state.weakSignals > 0 &&
      state.strongSignals === 0 &&
      state.domainSignals === 0 &&
      state.structuralSignals === 0
    ) {
      state.score += PENALTY_WEAK_TOKEN_ONLY;
    }

    if (isGenericFilePath(filePath) && state.strongSignals === 0 && state.structuralSignals === 0) {
      state.score += PENALTY_GENERIC_FILE;
    }
  }
}

function extractStructuralAnchors(fileScores: Map<string, FileScoreState>): string[] {
  return [...fileScores.entries()]
    .filter(([, state]) => state.strongSignals > 0)
    .sort((left, right) => {
      if (left[1].score !== right[1].score) {
        return right[1].score - left[1].score;
      }
      return left[0].localeCompare(right[0]);
    })
    .map(([filePath]) => filePath);
}

function bumpFileScore(
  map: Map<string, FileScoreState>,
  key: string,
  amount: number,
  signalType: "strong" | "domain" | "structural" | "weak"
): void {
  const current = map.get(key) ?? {
    score: 0,
    strongSignals: 0,
    domainSignals: 0,
    structuralSignals: 0,
    weakSignals: 0
  };
  current.score += amount;

  if (signalType === "strong") {
    current.strongSignals += 1;
  } else if (signalType === "domain") {
    current.domainSignals += 1;
  } else if (signalType === "structural") {
    current.structuralSignals += 1;
  } else {
    current.weakSignals += 1;
  }

  map.set(key, current);
}

function bumpScore(map: Map<string, number>, key: string, amount: number): void {
  const current = map.get(key) ?? 0;
  map.set(key, current + amount);
}

function sortAndLimitFileScores(scores: Map<string, FileScoreState>, limit: number): ScoredEntry[] {
  return [...scores.entries()]
    .filter(([, state]) => state.score > 0)
    .map(([value, state]) => ({ value, score: state.score }))
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }

      return left.value.localeCompare(right.value);
    })
    .slice(0, limit);
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

function enrichOneHopDependencies(paths: string[], queryLayer: LocalIndexQueryLayer): string[] {
  const expanded = new Set(paths);
  for (const path of paths) {
    const relation = queryLayer.findFilesRelatedByImportExport(path);
    if (relation === null) {
      continue;
    }
    for (const nested of relation.dependsOn) {
      expanded.add(nested);
    }
  }
  return dedupeAndSort([...expanded]);
}

function enrichOneHopImporters(paths: string[], queryLayer: LocalIndexQueryLayer): string[] {
  const expanded = new Set(paths);
  for (const path of paths) {
    const relation = queryLayer.findFilesRelatedByImportExport(path);
    if (relation === null) {
      continue;
    }
    for (const nested of relation.importedBy) {
      expanded.add(nested);
    }
  }
  return dedupeAndSort([...expanded]);
}

function isWeakToken(term: string): boolean {
  if (term.includes("/") || term.includes(".")) {
    return false;
  }

  if (STRONG_SHORT_TERMS.has(term)) {
    return false;
  }

  return term.length < 4;
}

function isPathLikeTerm(term: string): boolean {
  return term.includes("/") || term.includes(".") || term.includes("-");
}

function isExactPathMatch(relativePath: string, term: string): boolean {
  const normalizedPath = normalizeString(relativePath);
  const normalizedTerm = normalizeString(term);
  return (
    normalizedPath === normalizedTerm ||
    normalizedPath.endsWith(`/${normalizedTerm}`) ||
    normalizedPath === normalizedTerm.replace(/^\.\//, "")
  );
}

function normalizeString(value: string): string {
  return value.trim().toLowerCase().replace(/\\/g, "/");
}

function stripKnownExtension(fileName: string): string {
  const extension = extname(fileName);
  if (extension === ".ts" || extension === ".tsx" || extension === ".js" || extension === ".jsx") {
    return fileName.slice(0, -extension.length);
  }
  return fileName;
}

function isGenericFilePath(filePath: string): boolean {
  return GENERIC_FILE_NAMES.has(basename(filePath).toLowerCase());
}

function matchesDomainTerm(candidate: string, term: string, options: QueryMatchOptions): boolean {
  if (matchesText(candidate, term, options, false)) {
    return true;
  }

  const normalizedCandidate = normalizeForDomainFuzzy(candidate);
  const normalizedTerm = normalizeForDomainFuzzy(term);
  if (normalizedCandidate.length < 4 || normalizedTerm.length < 4) {
    return false;
  }

  if (
    normalizedCandidate.includes(normalizedTerm) ||
    normalizedTerm.includes(normalizedCandidate)
  ) {
    return true;
  }

  const prefix = normalizedTerm.slice(0, 4);
  return normalizedCandidate.includes(prefix);
}

function normalizeForDomainFuzzy(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/(.)\1+/g, "$1");
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
