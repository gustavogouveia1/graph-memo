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

export function extractTaskTerms(task: string, extraTerms: string[]): string[] {
  const combined = [task, ...extraTerms].join(" ");
  const normalized = normalizeText(combined);
  const parts = normalized.split(/[^a-z0-9_./-]+/g).map((part) => part.trim());
  const uniqueTerms = new Set<string>();

  for (const part of parts) {
    const clean = trimBoundaryPunctuation(part);
    if (clean.length === 0) {
      continue;
    }
    if (STOP_WORDS.has(clean)) {
      continue;
    }
    if (clean.length < 3 && !clean.includes("/") && !clean.includes(".")) {
      continue;
    }
    uniqueTerms.add(clean);

    if (/^[a-z]+$/.test(clean) && clean.length >= 7) {
      uniqueTerms.add(clean.slice(0, 3));
    }
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
