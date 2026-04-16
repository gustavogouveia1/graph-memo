import type { Command } from "commander";

import type { QueryIndexInput } from "../../application/use-cases/query-index.use-case";
import type { QueryIndexUseCase } from "../../application/use-cases/query-index.use-case";
import { printTaskExecution } from "../output/print-task-execution";

interface RegisterQueryCommandDependencies {
  queryIndexUseCase: QueryIndexUseCase;
}

interface QueryCommandOptions {
  symbol?: string;
  file?: string;
  module?: string;
  relatedTo?: string;
  listFiles: boolean;
  caseSensitive: boolean;
  exactMatch: boolean;
}

export function registerQueryCommand(
  program: Command,
  dependencies: RegisterQueryCommandDependencies
): void {
  program
    .command("query")
    .description("Consulta o indice local e relacoes basicas de codigo")
    .argument("[targetPath]", "Diretorio raiz onde existe o indice local", ".")
    .option("--symbol <name>", "Busca arquivos e exports por nome de simbolo")
    .option("--file <relativePath>", "Retorna detalhes de um arquivo indexado")
    .option("--module <source>", "Lista arquivos que importam um modulo especifico")
    .option(
      "--related-to <relativePath>",
      "Lista relacoes basicas de import/export para um arquivo"
    )
    .option("--list-files", "Lista todos os arquivos indexados", false)
    .option("--case-sensitive", "Compara texto com diferenca entre maiusculas/minusculas", true)
    .option("--no-case-sensitive", "Compara texto sem diferenca entre maiusculas/minusculas")
    .option("--exact-match", "Exige comparacao exata de texto", true)
    .option("--no-exact-match", "Permite comparacao parcial por contains")
    .action(async (targetPath: string, options: QueryCommandOptions) => {
      const input: QueryIndexInput = {
        targetPath,
        listFiles: options.listFiles,
        caseSensitive: options.caseSensitive,
        exactMatch: options.exactMatch
      };

      if (options.symbol !== undefined) {
        input.symbol = options.symbol;
      }
      if (options.file !== undefined) {
        input.file = options.file;
      }
      if (options.module !== undefined) {
        input.moduleSource = options.module;
      }
      if (options.relatedTo !== undefined) {
        input.relatedTo = options.relatedTo;
      }

      const result = await dependencies.queryIndexUseCase.execute(input);

      printTaskExecution(result);
    });
}
