import { readFile } from "node:fs/promises";

import type { MemoryQueryReaderPort } from "../../application/ports/memory-query-reader";
import type { MemoryState } from "../../application/ports/memory-store";
import { GraphMemoError } from "../../core/errors/graphmemo-error";
import { MEMORY_SCHEMA_VERSION, type MemoryMeta } from "../../core/memory/memory-types";
import {
  DEFAULT_STATE_DIR,
  resolveStateDirectoryForDisplay,
  resolveStateIndexPaths
} from "../../shared/config/state-index-paths";
import { resolveMemoryStatePaths } from "../../shared/config/state-memory-paths";

export class FileMemoryQueryReader implements MemoryQueryReaderPort {
  constructor(private readonly stateDir: string = DEFAULT_STATE_DIR) {}

  async read(rootPath: string): Promise<MemoryState> {
    const { stateDirectoryPath } = resolveStateIndexPaths(rootPath, this.stateDir);
    const {
      metaFilePath,
      nodesFilePath,
      edgesFilePath,
      factsFilePath,
      eventsFilePath,
      tasksFilePath
    } = resolveMemoryStatePaths(rootPath, this.stateDir);

    const stateDirectory = resolveStateDirectoryForDisplay(this.stateDir);

    let metaRaw: string;
    let nodesRaw: string;
    let edgesRaw: string;
    let factsRaw: string;
    let eventsRaw: string;
    let tasksRaw: string;

    try {
      [metaRaw, nodesRaw, edgesRaw, factsRaw, eventsRaw, tasksRaw] = await Promise.all([
        readFile(metaFilePath, "utf8"),
        readFile(nodesFilePath, "utf8"),
        readFile(edgesFilePath, "utf8"),
        readFile(factsFilePath, "utf8"),
        readFile(eventsFilePath, "utf8"),
        readFile(tasksFilePath, "utf8")
      ]);
    } catch (error: unknown) {
      throw new GraphMemoError(
        "MEMORY_NOT_FOUND",
        `Estado de memoria local nao encontrado em ${stateDirectory}memory/.`,
        error,
        { rootPath, stateDirectoryPath }
      );
    }

    let metaJson: unknown;
    let nodesJson: unknown;
    let edgesJson: unknown;
    let factsJson: unknown;
    let eventsJson: unknown;
    let tasksJson: unknown;

    try {
      metaJson = JSON.parse(metaRaw);
      nodesJson = JSON.parse(nodesRaw);
      edgesJson = JSON.parse(edgesRaw);
      factsJson = JSON.parse(factsRaw);
      eventsJson = JSON.parse(eventsRaw);
      tasksJson = JSON.parse(tasksRaw);
    } catch (error: unknown) {
      throw new GraphMemoError(
        "MEMORY_CORRUPTED",
        "O estado de memoria local esta corrompido ou incompativel.",
        error,
        { rootPath, stateDirectoryPath }
      );
    }

    if (!isMemoryMeta(metaJson)) {
      throw new GraphMemoError(
        "MEMORY_CORRUPTED",
        "O estado de memoria local esta corrompido ou incompativel.",
        undefined,
        { rootPath, stateDirectoryPath }
      );
    }

    if (metaJson.schemaVersion !== MEMORY_SCHEMA_VERSION) {
      throw new GraphMemoError(
        "MEMORY_SCHEMA_UNSUPPORTED",
        `Versao de schema de memoria nao suportada: ${metaJson.schemaVersion}.`,
        undefined,
        { rootPath, stateDirectoryPath, schemaVersion: metaJson.schemaVersion }
      );
    }

    if (
      !Array.isArray(nodesJson) ||
      !Array.isArray(edgesJson) ||
      !Array.isArray(factsJson) ||
      !Array.isArray(eventsJson) ||
      !Array.isArray(tasksJson)
    ) {
      throw new GraphMemoError(
        "MEMORY_CORRUPTED",
        "O estado de memoria local esta corrompido ou incompativel.",
        undefined,
        { rootPath, stateDirectoryPath }
      );
    }

    return {
      meta: metaJson,
      nodes: nodesJson,
      edges: edgesJson,
      facts: factsJson,
      events: eventsJson,
      tasks: tasksJson
    };
  }
}

function isMemoryMeta(value: unknown): value is MemoryMeta {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.schemaVersion === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.lastUpdatedAt === "string"
  );
}
