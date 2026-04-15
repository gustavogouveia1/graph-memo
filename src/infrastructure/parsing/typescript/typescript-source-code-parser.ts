import ts from "typescript";

import type { ParsedSourceCode, SourceCodeParserPort } from "../../../application/ports/source-code-parser";
import type { SourceExport } from "../../../core/indexing/source-export";
import type { SourceImport } from "../../../core/indexing/source-import";
import type { SourceSymbol } from "../../../core/indexing/source-symbol";

export class TypeScriptSourceCodeParser implements SourceCodeParserPort {
  parse(filePath: string, content: string): ParsedSourceCode {
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      this.resolveScriptKind(filePath)
    );

    const imports: SourceImport[] = [];
    const exports: SourceExport[] = [];
    const symbols: SourceSymbol[] = [];

    const visit = (node: ts.Node): void => {
      if (ts.isImportDeclaration(node)) {
        imports.push(...this.extractImportsFromDeclaration(node));
      }

      if (ts.isExportDeclaration(node)) {
        exports.push(...this.extractExportsFromDeclaration(node));
      }

      if (ts.isExportAssignment(node)) {
        exports.push({
          name: "default",
          kind: "value",
          isDefault: true
        });
      }

      if (ts.isFunctionDeclaration(node) && node.name !== undefined) {
        const functionName = node.name.text;
        symbols.push({ name: functionName, kind: "function" });

        if (this.hasExportModifier(node)) {
          exports.push({
            name: functionName,
            kind: "function",
            isDefault: this.hasDefaultModifier(node)
          });
        }
      }

      if (ts.isClassDeclaration(node) && node.name !== undefined) {
        const className = node.name.text;
        symbols.push({ name: className, kind: "class" });

        if (this.hasExportModifier(node)) {
          exports.push({
            name: className,
            kind: "class",
            isDefault: this.hasDefaultModifier(node)
          });
        }
      }

      if (ts.isVariableStatement(node) && this.hasExportModifier(node)) {
        exports.push(...this.extractExportsFromVariableStatement(node));
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return {
      imports,
      exports,
      symbols
    };
  }

  private resolveScriptKind(filePath: string): ts.ScriptKind {
    if (filePath.endsWith(".tsx")) {
      return ts.ScriptKind.TSX;
    }

    if (filePath.endsWith(".jsx")) {
      return ts.ScriptKind.JSX;
    }

    if (filePath.endsWith(".js")) {
      return ts.ScriptKind.JS;
    }

    return ts.ScriptKind.TS;
  }

  private extractImportsFromDeclaration(node: ts.ImportDeclaration): SourceImport[] {
    const source = this.getModuleSpecifier(node.moduleSpecifier);
    const importClause = node.importClause;

    if (importClause === undefined) {
      return [{ source, isTypeOnly: false }];
    }

    const imports: SourceImport[] = [];

    if (importClause.name !== undefined) {
      imports.push({
        source,
        isTypeOnly: importClause.isTypeOnly,
        name: "default",
        kind: importClause.isTypeOnly ? "type" : "value",
        isDefault: true,
        importedAs: importClause.name.text
      });
    }

    if (importClause.namedBindings !== undefined) {
      if (ts.isNamespaceImport(importClause.namedBindings)) {
        imports.push({
          source,
          isTypeOnly: importClause.isTypeOnly,
          name: "*",
          kind: importClause.isTypeOnly ? "type" : "value",
          isDefault: false,
          importedAs: importClause.namedBindings.name.text
        });
      } else {
        importClause.namedBindings.elements.forEach((element) => {
          const importedName = element.propertyName?.text ?? element.name.text;
          const importedAs = element.name.text;
          const isTypeOnly = importClause.isTypeOnly || element.isTypeOnly;

          imports.push({
            source,
            isTypeOnly,
            name: importedName,
            kind: isTypeOnly ? "type" : "value",
            isDefault: false,
            importedAs
          });
        });
      }
    }

    return imports;
  }

  private extractExportsFromDeclaration(node: ts.ExportDeclaration): SourceExport[] {
    const source = node.moduleSpecifier !== undefined ? this.getModuleSpecifier(node.moduleSpecifier) : undefined;

    if (node.exportClause === undefined) {
      return [];
    }

    if (ts.isNamespaceExport(node.exportClause)) {
      const namespaceExport: SourceExport = {
        name: "*",
        kind: "value",
        exportedAs: node.exportClause.name.text
      };

      if (source !== undefined) {
        namespaceExport.source = source;
      }

      return [
        namespaceExport
      ];
    }

    return node.exportClause.elements.map((element) => {
      const namedExport: SourceExport = {
        name: element.propertyName?.text ?? element.name.text,
        kind: element.isTypeOnly ? "type" : "value",
        isTypeOnly: element.isTypeOnly,
        exportedAs: element.name.text
      };

      if (source !== undefined) {
        namedExport.source = source;
      }

      return namedExport;
    });
  }

  private extractExportsFromVariableStatement(node: ts.VariableStatement): SourceExport[] {
    const exports: SourceExport[] = [];

    node.declarationList.declarations.forEach((declaration) => {
      if (ts.isIdentifier(declaration.name)) {
        exports.push({
          name: declaration.name.text,
          kind: "value",
          isDefault: this.hasDefaultModifier(node)
        });
      }
    });

    return exports;
  }

  private hasExportModifier(node: ts.Node): boolean {
    return (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0;
  }

  private hasDefaultModifier(node: ts.Node): boolean {
    return (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Default) !== 0;
  }

  private getModuleSpecifier(moduleSpecifier: ts.Expression): string {
    if (ts.isStringLiteral(moduleSpecifier)) {
      return moduleSpecifier.text;
    }

    return moduleSpecifier.getText();
  }
}
