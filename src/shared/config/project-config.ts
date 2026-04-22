import type { LogLevel } from "../../application/ports/logger";
import { DEFAULT_STATE_DIR } from "./state-index-paths";

export interface AiRefinementConfig {
  enabled: boolean;
  apiKey: string;
  model: string;
  timeoutMs: number;
}

export interface ProjectConfig {
  workspaceRoot: string;
  docsDir: string;
  knowledgeDir: string;
  stateDir: string;
  logLevel: LogLevel;
  aiRefinement: AiRefinementConfig;
}

export const PROJECT_CONFIG_FILE = "graphmemo.config.json";

export function getDefaultProjectConfig(workspaceRoot: string): ProjectConfig {
  return {
    workspaceRoot,
    docsDir: "docs",
    knowledgeDir: "knowledge",
    stateDir: DEFAULT_STATE_DIR,
    logLevel: "info",
    aiRefinement: {
      enabled: false,
      apiKey: "",
      model: "claude-3-5-sonnet-latest",
      timeoutMs: 8000
    }
  };
}
