export interface IndexManifest {
  schemaVersion: string;
  generatedAt: string;
  rootPath: string;
  indexedFilesCount: number;
  supportedExtensions: string[];
}
