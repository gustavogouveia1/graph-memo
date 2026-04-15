import type { BuiltContextPackage } from "./context-types";

export type ContextOutputFormat = "markdown" | "json";

export function formatBuiltContext(contextPackage: BuiltContextPackage, format: ContextOutputFormat): string {
  if (format === "json") {
    return JSON.stringify(contextPackage, null, 2);
  }

  return renderMarkdown(contextPackage);
}

function renderMarkdown(contextPackage: BuiltContextPackage): string {
  return [
    `Task: ${contextPackage.task}`,
    "",
    "Relevant Files",
    ...asList(contextPackage.relevantFiles),
    "",
    "Relevant Symbols",
    ...asList(contextPackage.relevantSymbols),
    "",
    "Relevant Modules",
    ...asList(contextPackage.relevantModules),
    "",
    "Relevant Knowledge Notes",
    ...asList(contextPackage.relevantKnowledgeNotes),
    "",
    "Relevant ADRs/Docs",
    ...asList(contextPackage.relevantAdrsAndDocs),
    "",
    "Suggested Starting Points",
    ...asList(contextPackage.suggestedStartingPoints)
  ].join("\n");
}

function asList(values: string[]): string[] {
  if (values.length === 0) {
    return ["- (nenhum resultado)"];
  }

  return values.map((value) => `- ${value}`);
}
