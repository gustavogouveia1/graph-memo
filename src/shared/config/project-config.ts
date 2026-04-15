import type { LogLevel } from "../../application/ports/logger";

export interface ProjectConfig {
  workspaceRoot: string;
  docsDir: string;
  knowledgeDir: string;
  stateDir: string;
  logLevel: LogLevel;
}

export const PROJECT_CONFIG_FILE = "graphmemo.config.json";

export function getDefaultProjectConfig(workspaceRoot: string): ProjectConfig {
  return {
    workspaceRoot,
    docsDir: "docs",
    knowledgeDir: "knowledge",
    stateDir: ".graphmemo",
    logLevel: "info"
  };
}
