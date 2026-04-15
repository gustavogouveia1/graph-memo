import type {
  ContextKnowledgeDocument,
  KnowledgeContextResult,
  StructuralContextResult
} from "./context-types";

interface KnowledgeMatcherInput {
  documents: ContextKnowledgeDocument[];
  structuralContext: StructuralContextResult;
  maxKnowledgeNotes: number;
  maxAdrsAndDocs: number;
}

interface ScoredDocument {
  document: ContextKnowledgeDocument;
  score: number;
}

const TITLE_MATCH_SCORE = 5;
const PATH_MATCH_SCORE = 4;
const CONTENT_MATCH_SCORE = 1;

export function buildKnowledgeContext(input: KnowledgeMatcherInput): KnowledgeContextResult {
  const terms = collectTerms(input.structuralContext);

  const scored = input.documents
    .map((document) => ({
      document,
      score: scoreDocument(document, terms)
    }))
    .filter((entry) => entry.score > 0);

  const scoredKnowledgeNotes = scored.filter(
    (entry) =>
      entry.document.category === "knowledge-note" || entry.document.category === "knowledge-import"
  );
  const scoredAdrsAndDocs = scored.filter(
    (entry) => entry.document.category === "adr" || entry.document.category === "engineering-doc"
  );

  const relevantAdrsAndDocs = sortAndLimit(scoredAdrsAndDocs, input.maxAdrsAndDocs).map(
    (entry) => entry.document.relativePath
  );

  return {
    relevantKnowledgeNotes: sortAndLimit(scoredKnowledgeNotes, input.maxKnowledgeNotes).map(
      (entry) => entry.document.relativePath
    ),
    relevantAdrsAndDocs:
      relevantAdrsAndDocs.length > 0
        ? relevantAdrsAndDocs
        : selectFallbackAdrsAndDocs(input.documents, input.maxAdrsAndDocs)
  };
}

function collectTerms(structuralContext: StructuralContextResult): string[] {
  const terms = new Set<string>();

  for (const term of structuralContext.extractedTerms) {
    terms.add(term.toLowerCase());
  }
  for (const file of structuralContext.relevantFiles) {
    terms.add(file.toLowerCase());
    for (const segment of file.toLowerCase().split(/[^a-z0-9]+/g)) {
      if (segment.length >= 3) {
        terms.add(segment);
      }
    }
  }
  for (const symbol of structuralContext.relevantSymbols) {
    terms.add(symbol.toLowerCase());
  }
  for (const moduleName of structuralContext.relevantModules) {
    terms.add(moduleName.toLowerCase());
  }

  return [...terms];
}

function scoreDocument(document: ContextKnowledgeDocument, terms: string[]): number {
  const searchablePath = document.relativePath.toLowerCase();
  const searchableTitle = document.title.toLowerCase();
  const searchableContent = document.content.toLowerCase();
  let score = 0;

  for (const term of terms) {
    if (term.length === 0) {
      continue;
    }

    if (searchableTitle.includes(term)) {
      score += TITLE_MATCH_SCORE;
    }
    if (searchablePath.includes(term)) {
      score += PATH_MATCH_SCORE;
    }
    if (searchableContent.includes(term)) {
      score += CONTENT_MATCH_SCORE;
    }
  }

  return score;
}

function sortAndLimit(entries: ScoredDocument[], limit: number): ScoredDocument[] {
  return [...entries]
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }

      return left.document.relativePath.localeCompare(right.document.relativePath);
    })
    .slice(0, limit);
}

function selectFallbackAdrsAndDocs(documents: ContextKnowledgeDocument[], limit: number): string[] {
  const candidates = documents.filter(
    (document) => document.category === "adr" || document.category === "engineering-doc"
  );

  return [...candidates]
    .sort((left, right) => {
      const priorityDelta = fallbackPriority(left) - fallbackPriority(right);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return left.relativePath.localeCompare(right.relativePath);
    })
    .slice(0, limit)
    .map((entry) => entry.relativePath);
}

function fallbackPriority(document: ContextKnowledgeDocument): number {
  if (document.relativePath.includes("ADR-001")) {
    return 0;
  }
  if (document.relativePath.includes("ADR-003")) {
    return 1;
  }
  if (document.relativePath.endsWith("overview.md")) {
    return 2;
  }
  if (document.relativePath.endsWith("architecture-rules.md")) {
    return 3;
  }
  if (document.relativePath.endsWith("error-handling-rules.md")) {
    return 4;
  }

  return 10;
}
