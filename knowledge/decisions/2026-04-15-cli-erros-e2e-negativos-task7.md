# Decisao: robustez de erros da CLI e E2E negativos (Task 7)

- **Data:** 2026-04-15
- **Status:** aceita

## Contexto

Era necessario endurecer a experiencia operacional: falhas previsiveis com codigos estaveis, mensagens acionaveis e testes E2E sobre comportamento observavel, sem stack cru para o usuario.

## Decisao

- Centralizar formatacao de erro tipado para terminal em `src/cli/user-error-output.ts`, consumida por `main.ts`.
- Manter `GraphMemoError` como transporte de `code` + `message` seguros; causa raiz permanece em `cause` / logs internos, fora da linha exibida ao usuario.
- Renomear codigo de origem inexistente na importacao de chats para `CHAT_SOURCE_NOT_FOUND` (mensagem orientando `--source`).
- Reforcar validacao de filtros vazios em `query` e `context` no caso de uso, com codigo `QUERY_INVALID_INPUT` / `CONTEXT_INVALID_INPUT`.
- E2E negativos via `createCli` (comportamento dos comandos) e um caso adicional via subprocesso `tsx` + `main.ts` para validar `exitCode === 1` e stderr sem stack.

## Consequencias

- Testes E2E reproduzem fluxo real sem framework novo.
- Mensagens de indice alinhadas a recuperacao explicita (`index` / `index --full`).
