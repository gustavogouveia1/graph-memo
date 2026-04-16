import { GraphMemoError } from "../core/errors/graphmemo-error";

/**
 * Formata erro tipado para o terminal (sem stack, sem detalhes internos).
 * Usado pela entrada `main` e pode ser reutilizado em testes E2E.
 */
export function formatGraphMemoErrorForCli(error: GraphMemoError): string {
  return `[${error.code}] ${error.message}`;
}

/**
 * Escreve erro de execução da CLI em stderr de forma segura para o usuário final.
 */
export function writeCliRuntimeError(error: unknown): void {
  if (error instanceof GraphMemoError) {
    console.error(formatGraphMemoErrorForCli(error));
    return;
  }

  const message = error instanceof Error ? error.message : "Erro inesperado na execucao da CLI.";
  console.error(message);
}
