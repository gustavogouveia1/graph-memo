import { access, readFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { join } from "node:path";

import type { LogLevel } from "../../application/ports/logger";
import { getDefaultProjectConfig, type ProjectConfig, PROJECT_CONFIG_FILE } from "./project-config";

interface RawConfig {
  docsDir?: string;
  knowledgeDir?: string;
  stateDir?: string;
  logLevel?: LogLevel;
}

export async function loadProjectConfig(workspaceRoot = process.cwd()): Promise<ProjectConfig> {
  const defaults = getDefaultProjectConfig(workspaceRoot);
  const configPath = join(workspaceRoot, PROJECT_CONFIG_FILE);

  try {
    await access(configPath, fsConstants.F_OK);
  } catch {
    return defaults;
  }

  const fileContent = await readFile(configPath, "utf8");
  const parsed = JSON.parse(fileContent) as RawConfig;

  return {
    workspaceRoot,
    docsDir: parsed.docsDir ?? defaults.docsDir,
    knowledgeDir: parsed.knowledgeDir ?? defaults.knowledgeDir,
    stateDir: parsed.stateDir ?? defaults.stateDir,
    logLevel: parsed.logLevel ?? defaults.logLevel
  };
}
