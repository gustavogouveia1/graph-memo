import { access, readFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { join } from "node:path";

import type { LogLevel } from "../../application/ports/logger";
import { getDefaultProjectConfig, type ProjectConfig, PROJECT_CONFIG_FILE } from "./project-config";

interface RawAiRefinementConfig {
  enabled?: boolean;
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
}

interface RawConfig {
  docsDir?: string;
  knowledgeDir?: string;
  stateDir?: string;
  logLevel?: LogLevel;
  aiRefinement?: RawAiRefinementConfig;
}

export async function loadProjectConfig(workspaceRoot = process.cwd()): Promise<ProjectConfig> {
  const defaults = getDefaultProjectConfig(workspaceRoot);
  const configPath = join(workspaceRoot, PROJECT_CONFIG_FILE);
  const parsed = await readRawConfig(configPath);

  return {
    workspaceRoot,
    docsDir: parsed?.docsDir ?? defaults.docsDir,
    knowledgeDir: parsed?.knowledgeDir ?? defaults.knowledgeDir,
    stateDir: parsed?.stateDir ?? defaults.stateDir,
    logLevel: parsed?.logLevel ?? defaults.logLevel,
    aiRefinement: {
      enabled:
        readEnvBoolean("GRAPHMEMO_AI_REFINEMENT_ENABLED") ??
        parsed?.aiRefinement?.enabled ??
        defaults.aiRefinement.enabled,
      apiKey:
        process.env.GRAPHMEMO_CLAUDE_API_KEY ??
        parsed?.aiRefinement?.apiKey ??
        defaults.aiRefinement.apiKey,
      model:
        process.env.GRAPHMEMO_CLAUDE_MODEL ??
        parsed?.aiRefinement?.model ??
        defaults.aiRefinement.model,
      timeoutMs:
        readEnvNumber("GRAPHMEMO_CLAUDE_TIMEOUT_MS") ??
        parsed?.aiRefinement?.timeoutMs ??
        defaults.aiRefinement.timeoutMs
    }
  };
}

async function readRawConfig(configPath: string): Promise<RawConfig | undefined> {
  try {
    await access(configPath, fsConstants.F_OK);
    const fileContent = await readFile(configPath, "utf8");
    return JSON.parse(fileContent) as RawConfig;
  } catch {
    return undefined;
  }
}

function readEnvBoolean(name: string): boolean | undefined {
  const raw = process.env[name];
  if (raw === undefined) {
    return undefined;
  }
  if (raw === "true") {
    return true;
  }
  if (raw === "false") {
    return false;
  }
  return undefined;
}

function readEnvNumber(name: string): number | undefined {
  const raw = process.env[name];
  if (raw === undefined) {
    return undefined;
  }
  const parsed = Number(raw);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }
  return parsed;
}
