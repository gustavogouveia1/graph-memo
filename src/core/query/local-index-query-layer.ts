import { dirname, extname, join } from "node:path";

import type { IndexedFile } from "../indexing/indexed-file";
import type { SourceExport } from "../indexing/source-export";
import type { QueryMatchOptions } from "./basic-relations";
import type { BasicGraphRelation } from "./basic-relations";

export interface FileDetails {
  relativePath: string;
  symbols: IndexedFile["symbols"];
  imports: IndexedFile["imports"];
  exports: IndexedFile["exports"];
}

export interface ExportMatch {
  filePath: string;
  exportEntry: SourceExport;
}

export interface RelatedFilesResult {
  relativePath: string;
  dependsOn: string[];
  importedBy: string[];
}

const SUPPORTED_INDEX_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"] as const;

export class LocalIndexQueryLayer {
  private readonly filesByPath: Map<string, IndexedFile>;
  private readonly relations: BasicGraphRelation[];
  private readonly indexedPaths: Set<string>;

  constructor(private readonly files: IndexedFile[]) {
    this.filesByPath = new Map(files.map((file) => [file.relativePath, file]));
    this.relations = this.buildRelations(files);
    this.indexedPaths = new Set(files.map((file) => file.relativePath));
  }

  listIndexedFiles(): string[] {
    return [...this.filesByPath.keys()].sort((left, right) => left.localeCompare(right));
  }

  findFilesBySymbol(name: string, options: QueryMatchOptions = {}): string[] {
    const matcher = this.createMatcher(name, options);
    return this.relations
      .flatMap((relation) => {
        if (relation.type !== "file_defines_symbol") {
          return [];
        }

        if (!matcher(relation.symbol.name)) {
          return [];
        }

        return [relation];
      })
      .map((relation) => relation.filePath)
      .filter((filePath, index, all) => all.indexOf(filePath) === index)
      .sort((left, right) => left.localeCompare(right));
  }

  getFileDetails(relativePath: string): FileDetails | null {
    const file = this.filesByPath.get(relativePath);
    if (file === undefined) {
      return null;
    }

    return {
      relativePath: file.relativePath,
      symbols: file.symbols,
      imports: file.imports,
      exports: file.exports
    };
  }

  findExportsBySymbol(name: string, options: QueryMatchOptions = {}): ExportMatch[] {
    const matcher = this.createMatcher(name, options);
    return this.relations
      .flatMap((relation) => {
        if (relation.type !== "file_exports_symbol") {
          return [];
        }

        if (!matcher(relation.symbolName)) {
          return [];
        }

        return [relation];
      })
      .map((relation) => ({
        filePath: relation.filePath,
        exportEntry: relation.exportEntry
      }))
      .sort((left, right) => left.filePath.localeCompare(right.filePath));
  }

  findFilesImportingModule(source: string, options: QueryMatchOptions = {}): string[] {
    const matcher = this.createMatcher(source, options);
    return this.relations
      .filter((relation) => relation.type === "file_imports_module" && matcher(relation.source))
      .map((relation) => relation.filePath)
      .filter((filePath, index, all) => all.indexOf(filePath) === index)
      .sort((left, right) => left.localeCompare(right));
  }

  findFilesRelatedByImportExport(relativePath: string): RelatedFilesResult | null {
    const file = this.filesByPath.get(relativePath);
    if (file === undefined) {
      return null;
    }

    const dependsOn = file.imports
      .flatMap((importEntry) => this.resolveImportSource(relativePath, importEntry.source))
      .filter((value, index, all) => all.indexOf(value) === index)
      .sort((left, right) => left.localeCompare(right));

    const importedBy = this.files
      .filter((candidate) => {
        if (candidate.relativePath === relativePath) {
          return false;
        }

        return candidate.imports.some((importEntry) =>
          this.resolveImportSource(candidate.relativePath, importEntry.source).includes(
            relativePath
          )
        );
      })
      .map((candidate) => candidate.relativePath)
      .sort((left, right) => left.localeCompare(right));

    return {
      relativePath,
      dependsOn,
      importedBy
    };
  }

  getRelations(): BasicGraphRelation[] {
    return [...this.relations];
  }

  private buildRelations(files: IndexedFile[]): BasicGraphRelation[] {
    const relations: BasicGraphRelation[] = [];

    files.forEach((file) => {
      file.symbols.forEach((symbol) => {
        relations.push({
          type: "file_defines_symbol",
          filePath: file.relativePath,
          symbol
        });
      });

      file.imports.forEach((importEntry) => {
        relations.push({
          type: "file_imports_module",
          filePath: file.relativePath,
          source: importEntry.source,
          importEntry
        });
      });

      file.exports.forEach((exportEntry) => {
        relations.push({
          type: "file_exports_symbol",
          filePath: file.relativePath,
          symbolName: exportEntry.exportedAs ?? exportEntry.name,
          exportEntry
        });
      });
    });

    return relations;
  }

  private createMatcher(input: string, options: QueryMatchOptions): (candidate: string) => boolean {
    const exactMatch = options.exactMatch ?? true;
    const caseSensitive = options.caseSensitive ?? true;

    const query = caseSensitive ? input : input.toLowerCase();

    return (candidate: string): boolean => {
      const comparableCandidate = caseSensitive ? candidate : candidate.toLowerCase();

      if (exactMatch) {
        return comparableCandidate === query;
      }

      return comparableCandidate.includes(query);
    };
  }

  private resolveImportSource(importerPath: string, source: string): string[] {
    if (source.startsWith(".")) {
      const normalizedBasePath = join(dirname(importerPath), source).split("\\").join("/");
      return this.expandPathCandidates(normalizedBasePath).filter((candidate) =>
        this.indexedPaths.has(candidate)
      );
    }

    const aliasCandidates = this.resolveAliasImportSource(source);
    return aliasCandidates.filter((candidate) => this.indexedPaths.has(candidate));
  }

  private resolveAliasImportSource(source: string): string[] {
    const normalizedSource = source.replace(/\\/g, "/");
    const baseCandidates = new Set<string>();

    if (normalizedSource.startsWith("@/") || normalizedSource.startsWith("~/")) {
      const withoutPrefix = normalizedSource.slice(2);
      baseCandidates.add(withoutPrefix);
      baseCandidates.add(`src/${withoutPrefix}`);
      baseCandidates.add(`frontend/src/${withoutPrefix}`);
      baseCandidates.add(`backend/src/${withoutPrefix}`);
    }

    if (normalizedSource.startsWith("/")) {
      const withoutPrefix = normalizedSource.slice(1);
      baseCandidates.add(withoutPrefix);
      baseCandidates.add(`src/${withoutPrefix}`);
    }

    if (normalizedSource.startsWith("src/")) {
      baseCandidates.add(normalizedSource);
    }

    if (/^@[^/]+\/.+/.test(normalizedSource)) {
      const [, withoutScope] = normalizedSource.split("/", 2);
      if (withoutScope !== undefined && withoutScope.length > 0) {
        const rest = normalizedSource.slice(normalizedSource.indexOf("/") + 1);
        baseCandidates.add(rest);
        baseCandidates.add(`src/${rest}`);
      }
    }

    const expanded = new Set<string>();
    for (const candidate of baseCandidates) {
      for (const expandedCandidate of this.expandPathCandidates(candidate)) {
        expanded.add(expandedCandidate);
      }
    }

    return [...expanded];
  }

  private expandPathCandidates(basePath: string): string[] {
    const normalizedBasePath = basePath.replace(/\\/g, "/").replace(/\/+$/, "");
    const hasExtension = extname(normalizedBasePath) !== "";
    const baseWithoutExtension = hasExtension
      ? normalizedBasePath.slice(0, -extname(normalizedBasePath).length)
      : normalizedBasePath;
    const candidates = new Set<string>();

    candidates.add(normalizedBasePath);

    for (const extension of SUPPORTED_INDEX_EXTENSIONS) {
      candidates.add(`${baseWithoutExtension}${extension}`);
      candidates.add(`${baseWithoutExtension}/index${extension}`);
    }

    return [...candidates];
  }
}
