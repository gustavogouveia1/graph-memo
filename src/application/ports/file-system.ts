export interface FileMetadata {
  size: number;
  mtimeMs: number;
}

export interface FileSystemPort {
  listFilesRecursively(rootPath: string, ignoredDirectories: string[]): Promise<string[]>;
  readTextFile(filePath: string): Promise<string>;
  readFileBuffer(filePath: string): Promise<Buffer>;
  getFileMetadata(filePath: string): Promise<FileMetadata>;
}
