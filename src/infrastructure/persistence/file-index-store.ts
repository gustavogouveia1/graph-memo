import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { IndexStorePort, StoredIndex } from "../../application/ports/index-store";

const STATE_DIRECTORY_NAME = ".graphmemo";
const MANIFEST_FILE_NAME = "manifest.json";
const FILES_FILE_NAME = "files.json";

export class FileIndexStore implements IndexStorePort {
  async load(rootPath: string): Promise<StoredIndex | null> {
    try {
      const manifestFilePath = join(rootPath, STATE_DIRECTORY_NAME, MANIFEST_FILE_NAME);
      const filesFilePath = join(rootPath, STATE_DIRECTORY_NAME, FILES_FILE_NAME);

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
    const stateDirectoryPath = join(rootPath, STATE_DIRECTORY_NAME);
    const manifestFilePath = join(stateDirectoryPath, MANIFEST_FILE_NAME);
    const filesFilePath = join(stateDirectoryPath, FILES_FILE_NAME);

    await mkdir(stateDirectoryPath, { recursive: true });
    await Promise.all([
      writeFile(manifestFilePath, JSON.stringify(index.manifest, null, 2), "utf8"),
      writeFile(filesFilePath, JSON.stringify(index.files, null, 2), "utf8")
    ]);
  }
}
