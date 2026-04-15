import { describe, expect, it } from "vitest";

import { TypeScriptSourceCodeParser } from "../../src/infrastructure/parsing/typescript/typescript-source-code-parser";

describe("TypeScriptSourceCodeParser", () => {
  it("extrai imports, exports e simbolos nomeados", () => {
    const parser = new TypeScriptSourceCodeParser();
    const source = `
      import React from "react";
      import type { Config } from "./types";
      import { run as runAlias } from "@/core/run";
      export function runIndex(): void {}
      export class IndexService {}
    `;

    const result = parser.parse("/tmp/project/src/indexer.ts", source);

    expect(result.imports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "react", isDefault: true, importedAs: "React" }),
        expect.objectContaining({ source: "./types", name: "Config", isTypeOnly: true }),
        expect.objectContaining({ source: "@/core/run", name: "run", importedAs: "runAlias" })
      ])
    );
    expect(result.symbols).toEqual(
      expect.arrayContaining([
        { name: "runIndex", kind: "function" },
        { name: "IndexService", kind: "class" }
      ])
    );
    expect(result.exports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "runIndex", kind: "function" }),
        expect.objectContaining({ name: "IndexService", kind: "class" })
      ])
    );
  });
});
