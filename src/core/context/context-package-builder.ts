import type {
  BuiltContextPackage,
  KnowledgeContextResult,
  StructuralContextResult
} from "./context-types";

interface ContextPackageBuilderInput {
  structuralContext: StructuralContextResult;
  knowledgeContext: KnowledgeContextResult;
  maxStartingPoints: number;
}

export function buildContextPackage(input: ContextPackageBuilderInput): BuiltContextPackage {
  const suggestedStartingPoints = collectStartingPoints(input).slice(0, input.maxStartingPoints);

  return {
    ...input.structuralContext,
    ...input.knowledgeContext,
    suggestedStartingPoints
  };
}

function collectStartingPoints(input: ContextPackageBuilderInput): string[] {
  const suggestions: string[] = [];
  const [firstFile, secondFile] = input.structuralContext.relevantFiles;
  const [firstRelation] = input.structuralContext.fileRelations;
  const [firstKnowledge] = input.knowledgeContext.relevantKnowledgeNotes;
  const [firstAdrOrDoc] = input.knowledgeContext.relevantAdrsAndDocs;

  if (firstFile !== undefined) {
    suggestions.push(`Abrir ${firstFile} para mapear o fluxo principal ligado a task.`);
  }
  if (firstRelation !== undefined) {
    const relationHint = firstRelation.dependsOn[0] ?? firstRelation.importedBy[0];
    if (relationHint !== undefined) {
      suggestions.push(`Revisar relacao entre ${firstRelation.filePath} e ${relationHint}.`);
    }
  }
  if (secondFile !== undefined) {
    suggestions.push(
      `Comparar ${firstFile ?? secondFile} com ${secondFile} para identificar impacto lateral.`
    );
  }
  if (firstKnowledge !== undefined) {
    suggestions.push(`Ler ${firstKnowledge} para recuperar contexto historico relevante.`);
  }
  if (firstAdrOrDoc !== undefined) {
    suggestions.push(`Conferir ${firstAdrOrDoc} para alinhar implementacao com governanca ativa.`);
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Nao houve matches suficientes; refine a task com simbolo, arquivo ou modulo."
    );
  }

  return [...new Set(suggestions)];
}
