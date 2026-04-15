import { join, relative } from "node:path";

import type { FileSystemPort } from "../../application/ports/file-system";
import type { KnowledgeContextReaderPort } from "../../application/ports/knowledge-context-reader";
import type {
  ContextKnowledgeCategory,
  ContextKnowledgeDocument
} from "../../core/context/context-types";

interface FileKnowledgeContextReaderConfig {
  knowledgeDirectory: string;
  docsDirectory: string;
}

export class FileKnowledgeContextReader implements KnowledgeContextReaderPort {
  constructor(
    private readonly fileSystem: FileSystemPort,
    private readonly config: FileKnowledgeContextReaderConfig
  ) {}

  async readDocuments(rootPath: string): Promise<ContextKnowledgeDocument[]> {
    const knowledgeRootPath = join(rootPath, this.config.knowledgeDirectory);
    const docsRootPath = join(rootPath, this.config.docsDirectory);
    const [knowledgeFiles, docsFiles] = await Promise.all([
      this.fileSystem.listFilesRecursively(knowledgeRootPath, []),
      this.fileSystem.listFilesRecursively(docsRootPath, [])
    ]);

    const markdownFiles = [...knowledgeFiles, ...docsFiles]
      .filter((filePath) => filePath.endsWith(".md"))
      .sort((left, right) => left.localeCompare(right));

    const documents: ContextKnowledgeDocument[] = [];

    for (const absolutePath of markdownFiles) {
      const relativePath = relative(rootPath, absolutePath).split("\\").join("/");
      const category = classifyDocument(relativePath);
      if (category === null) {
        continue;
      }

      const content = await this.fileSystem.readTextFile(absolutePath);
      documents.push({
        relativePath,
        title: extractTitle(relativePath, content),
        content,
        category
      });
    }

    return documents;
  }
}

function classifyDocument(relativePath: string): ContextKnowledgeCategory | null {
  if (relativePath.startsWith("knowledge/imports/")) {
    return "knowledge-import";
  }
  if (relativePath.startsWith("knowledge/")) {
    return "knowledge-note";
  }
  if (relativePath.startsWith("docs/adr/")) {
    return "adr";
  }
  if (relativePath.startsWith("docs/engineering/")) {
    return "engineering-doc";
  }

  return null;
}

function extractTitle(relativePath: string, content: string): string {
  const lines = content.split("\n");
  const heading = lines.find((line) => line.startsWith("# "));
  if (heading !== undefined) {
    return heading.replace("# ", "").trim();
  }

  const fallback = relativePath.split("/").at(-1) ?? relativePath;
  return fallback.replace(".md", "").replace(/-/g, " ").trim();
}
