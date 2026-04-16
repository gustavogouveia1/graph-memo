import { readFile } from "node:fs/promises";

import type { IndexQueryReaderPort } from "../../application/ports/index-query-reader";
import type { StoredIndex } from "../../application/ports/index-store";
import { GraphMemoError } from "../../core/errors/graphmemo-error";
import type { IndexedFile } from "../../core/indexing/indexed-file";
import type { IndexManifest } from "../../core/indexing/index-manifest";
import {
  DEFAULT_STATE_DIR,
  resolveStateDirectoryForDisplay,
  resolveStateIndexPaths
} from "../../shared/config/state-index-paths";

export class FileIndexQueryReader implements IndexQueryReaderPort {
  constructor(private readonly stateDir: string = DEFAULT_STATE_DIR) {}

  async read(rootPath: string): Promise<StoredIndex> {
    const { manifestFilePath, filesFilePath } = resolveStateIndexPaths(rootPath, this.stateDir);
    const stateDirectory = resolveStateDirectoryForDisplay(this.stateDir);

    let manifestRaw: string;
    let filesRaw: string;
    try {
      [manifestRaw, filesRaw] = await Promise.all([
        readFile(manifestFilePath, "utf8"),
        readFile(filesFilePath, "utf8")
      ]);
    } catch (error: unknown) {
      throw new GraphMemoError(
        "INDEX_NOT_FOUND",
        `Indice local nao encontrado em ${stateDirectory}. Execute 'graphmemo index <caminho>' antes de usar este comando.`,
        error,
        { rootPath }
      );
    }

    let manifestJson: unknown;
    let filesJson: unknown;
    try {
      manifestJson = JSON.parse(manifestRaw);
      filesJson = JSON.parse(filesRaw);
    } catch (error: unknown) {
      throw new GraphMemoError(
        "INDEX_CORRUPTED",
        "O indice local esta corrompido ou incompativel. Execute 'graphmemo index <caminho> --full' para reconstrui-lo.",
        error,
        { rootPath }
      );
    }

    if (!isIndexManifest(manifestJson) || !isIndexedFileList(filesJson)) {
      throw new GraphMemoError(
        "INDEX_CORRUPTED",
        "O indice local esta corrompido ou incompativel. Execute 'graphmemo index <caminho> --full' para reconstrui-lo.",
        undefined,
        { rootPath }
      );
    }

    return {
      manifest: manifestJson,
      files: filesJson
    };
  }
}

function isIndexManifest(value: unknown): value is IndexManifest {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.schemaVersion === "string" &&
    typeof candidate.generatedAt === "string" &&
    typeof candidate.rootPath === "string" &&
    typeof candidate.indexedFilesCount === "number" &&
    Array.isArray(candidate.supportedExtensions) &&
    candidate.supportedExtensions.every((extension) => typeof extension === "string")
  );
}

function isIndexedFileList(value: unknown): value is IndexedFile[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((file) => isIndexedFile(file));
}

function isIndexedFile(value: unknown): value is IndexedFile {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.relativePath === "string" &&
    typeof candidate.extension === "string" &&
    typeof candidate.size === "number" &&
    typeof candidate.mtimeMs === "number" &&
    typeof candidate.hash === "string" &&
    Array.isArray(candidate.imports) &&
    Array.isArray(candidate.exports) &&
    Array.isArray(candidate.symbols)
  );
}
