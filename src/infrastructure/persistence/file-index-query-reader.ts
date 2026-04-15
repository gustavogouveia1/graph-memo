import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { IndexQueryReaderPort } from "../../application/ports/index-query-reader";
import type { StoredIndex } from "../../application/ports/index-store";
import { GraphMemoError } from "../../core/errors/graphmemo-error";
import type { IndexedFile } from "../../core/indexing/indexed-file";
import type { IndexManifest } from "../../core/indexing/index-manifest";

const STATE_DIRECTORY_NAME = ".graphmemo";
const MANIFEST_FILE_NAME = "manifest.json";
const FILES_FILE_NAME = "files.json";

export class FileIndexQueryReader implements IndexQueryReaderPort {
  async read(rootPath: string): Promise<StoredIndex> {
    const manifestPath = join(rootPath, STATE_DIRECTORY_NAME, MANIFEST_FILE_NAME);
    const filesPath = join(rootPath, STATE_DIRECTORY_NAME, FILES_FILE_NAME);

    let manifestRaw: string;
    let filesRaw: string;
    try {
      [manifestRaw, filesRaw] = await Promise.all([
        readFile(manifestPath, "utf8"),
        readFile(filesPath, "utf8")
      ]);
    } catch (error: unknown) {
      throw new GraphMemoError(
        "INDEX_NOT_FOUND",
        "Indice local nao encontrado. Execute `graphmemo index` antes de consultar.",
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
        "Indice local corrompido. Execute `graphmemo index --full` para regenerar os arquivos.",
        error,
        { rootPath }
      );
    }

    if (!isIndexManifest(manifestJson) || !isIndexedFileList(filesJson)) {
      throw new GraphMemoError(
        "INDEX_CORRUPTED",
        "Indice local com contrato invalido. Execute `graphmemo index --full` para corrigir.",
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
