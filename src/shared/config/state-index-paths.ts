import { join } from "node:path";

export const DEFAULT_STATE_DIR = ".graphmemo";
export const MANIFEST_FILE_NAME = "manifest.json";
export const FILES_FILE_NAME = "files.json";

interface StatePathParts {
  normalizedStateDir: string;
  topLevelDirectory: string;
}

export interface StateIndexPaths {
  stateDirectoryPath: string;
  manifestFilePath: string;
  filesFilePath: string;
}

export function resolveStateIndexPaths(rootPath: string, stateDir: string): StateIndexPaths {
  const { normalizedStateDir } = resolveStatePathParts(stateDir);
  const stateDirectoryPath = join(rootPath, normalizedStateDir);

  return {
    stateDirectoryPath,
    manifestFilePath: join(stateDirectoryPath, MANIFEST_FILE_NAME),
    filesFilePath: join(stateDirectoryPath, FILES_FILE_NAME)
  };
}

export function resolveStateDirectoryForDisplay(stateDir: string): string {
  const { normalizedStateDir } = resolveStatePathParts(stateDir);
  return normalizedStateDir.endsWith("/") ? normalizedStateDir : `${normalizedStateDir}/`;
}

export function resolveStateDirectoryForIgnore(stateDir: string): string {
  const { topLevelDirectory } = resolveStatePathParts(stateDir);
  return topLevelDirectory;
}

function resolveStatePathParts(stateDir: string): StatePathParts {
  const sanitized = sanitizeStateDir(stateDir);
  const segments = sanitized
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0 && segment !== ".");

  if (segments.length === 0) {
    return {
      normalizedStateDir: DEFAULT_STATE_DIR,
      topLevelDirectory: DEFAULT_STATE_DIR
    };
  }

  return {
    normalizedStateDir: segments.join("/"),
    topLevelDirectory: segments[0] ?? DEFAULT_STATE_DIR
  };
}

function sanitizeStateDir(stateDir: string): string {
  const trimmed = stateDir.trim();
  if (trimmed.length === 0) {
    return DEFAULT_STATE_DIR;
  }

  return trimmed.replace(/\\/g, "/");
}
