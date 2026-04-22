import type { BuiltContextPackage } from "../../core/context/context-types";

export interface PromptPackage {
  objective: string;
  constraints: string[];
  contextHighlights: string[];
  suggestedPrompt: string;
}

export interface RefinedContextOutput {
  summary: string;
  refinedTaskBrief: string;
  keyFiles: string[];
  keyRisks: string[];
  suggestedImplementationFocus: string[];
  suggestedStartingPoint: string;
  implementationPrompt: string;
  promptPackage: PromptPackage;
}

export interface RefineContextInput {
  task: string;
  deterministicContext: BuiltContextPackage;
}

export interface AiContextRefinerPort {
  refineContext(input: RefineContextInput): Promise<RefinedContextOutput>;
}
