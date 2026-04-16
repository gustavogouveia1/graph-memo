const STOP_WORDS = new Set([
  "a",
  "ao",
  "aos",
  "as",
  "com",
  "como",
  "da",
  "das",
  "de",
  "do",
  "dos",
  "e",
  "em",
  "na",
  "nas",
  "no",
  "nos",
  "o",
  "os",
  "ou",
  "para",
  "por",
  "que",
  "sem",
  "task",
  "uma",
  "um",
  "the",
  "and",
  "for",
  "with",
  "without",
  "from",
  "into",
  "fix",
  "feature"
]);

const MIN_TERM_LENGTH = 4;
const STRONG_SHORT_TERMS = new Set(["csv", "api", "sql", "pdf", "xml", "jwt", "url"]);

export function extractTaskTerms(task: string, extraTerms: string[]): string[] {
  const uniqueTerms = new Set<string>();
  const normalizedTask = normalizeText(task);
  const taskParts = normalizedTask.split(/[^a-z0-9_./-]+/g).map((part) => part.trim());

  for (const part of taskParts) {
    const clean = trimBoundaryPunctuation(part);
    if (clean.length === 0) {
      continue;
    }
    if (STOP_WORDS.has(clean)) {
      continue;
    }
    if (!isStrongTerm(clean)) {
      continue;
    }
    uniqueTerms.add(clean);
  }

  for (const extraTerm of extraTerms) {
    const normalized = normalizeText(extraTerm);
    const clean = trimBoundaryPunctuation(normalized);
    if (clean.length === 0) {
      continue;
    }
    uniqueTerms.add(clean);
  }

  return [...uniqueTerms].sort((left, right) => {
    if (left.length !== right.length) {
      return right.length - left.length;
    }

    return left.localeCompare(right);
  });
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function trimBoundaryPunctuation(value: string): string {
  return value.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
}

function isStrongTerm(term: string): boolean {
  if (term.includes("/") || term.includes(".")) {
    return true;
  }

  if (STRONG_SHORT_TERMS.has(term)) {
    return true;
  }

  return term.length >= MIN_TERM_LENGTH;
}
