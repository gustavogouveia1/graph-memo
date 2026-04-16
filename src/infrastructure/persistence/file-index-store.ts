import { mkdir, readFile, writeFile } from "node:fs/promises";

import type { IndexStorePort, StoredIndex } from "../../application/ports/index-store";
import { DEFAULT_STATE_DIR, resolveStateIndexPaths } from "../../shared/config/state-index-paths";

export class FileIndexStore implements IndexStorePort {
  constructor(private readonly stateDir: string = DEFAULT_STATE_DIR) {}

  async load(rootPath: string): Promise<StoredIndex | null> {
    try {
      const { manifestFilePath, filesFilePath } = resolveStateIndexPaths(rootPath, this.stateDir);

      const [manifestContent, filesContent] = await Promise.all([
        readFile(manifestFilePath, "utf8"),
        readFile(filesFilePath, "utf8")
      ]);

      return {
        manifest: JSON.parse(manifestContent),
        files: JSON.parse(filesContent)
      } as StoredIndex;
    } catch {
      return null;
    }
  }

  async save(rootPath: string, index: StoredIndex): Promise<void> {
    const { stateDirectoryPath, manifestFilePath, filesFilePath } = resolveStateIndexPaths(
      rootPath,
      this.stateDir
    );

    await mkdir(stateDirectoryPath, { recursive: true });
    await Promise.all([
      writeFile(manifestFilePath, JSON.stringify(index.manifest, null, 2), "utf8"),
      writeFile(filesFilePath, JSON.stringify(index.files, null, 2), "utf8")
    ]);
  }
}
