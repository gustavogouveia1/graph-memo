import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

import type { FileMetadata, FileSystemPort } from "../../application/ports/file-system";

export class NodeFileSystem implements FileSystemPort {
  async listFilesRecursively(rootPath: string, ignoredDirectories: string[]): Promise<string[]> {
    const files: string[] = [];
    const ignored = new Set(ignoredDirectories);

    await this.walk(rootPath, ignored, files);

    return files;
  }

  async readTextFile(filePath: string): Promise<string> {
    return readFile(filePath, "utf8");
  }

  async readFileBuffer(filePath: string): Promise<Buffer> {
    return readFile(filePath);
  }

  async getFileMetadata(filePath: string): Promise<FileMetadata> {
    const fileStats = await stat(filePath);

    return {
      size: fileStats.size,
      mtimeMs: fileStats.mtimeMs
    };
  }

  private async walk(
    currentPath: string,
    ignoredDirectories: Set<string>,
    files: string[]
  ): Promise<void> {
    const entries = await readdir(currentPath, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        if (entry.isDirectory()) {
          if (ignoredDirectories.has(entry.name)) {
            return;
          }

          await this.walk(join(currentPath, entry.name), ignoredDirectories, files);
          return;
        }

        if (!entry.isFile()) {
          return;
        }

        files.push(join(currentPath, entry.name));
      })
    );
  }
}
