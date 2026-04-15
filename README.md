# Graph-Memo

Sistema local de memoria persistente e knowledge graph para desenvolvimento assistido por IA.

Este bootstrap entrega a base executavel da CLI em TypeScript, com arquitetura modular pronta para evoluir para indexacao, importacao de chats e context builder.

## Stack

- Node.js
- TypeScript
- CLI com `commander`
- Lint com ESLint
- Formatacao com Prettier
- Testes com Vitest

## Estrutura inicial

```text
src/
  cli/              # entrada da aplicacao e comandos da CLI
  application/      # casos de uso e portas de aplicacao
  core/             # tipos e contratos centrais de dominio
  infrastructure/   # adaptadores concretos (ex.: logger)
  shared/           # configuracao e utilitarios compartilhados
tests/              # testes unitarios e de comportamento inicial
scripts/            # automacoes locais de qualidade
docs/               # governanca e ADRs
knowledge/          # memoria viva do projeto
```

## Comandos da CLI (stubs)

```bash
graphmemo index [targetPath] [--full] [--dry-run]
graphmemo context --task <taskId> [--format markdown|json]
graphmemo import-chats --source <path> [--provider cursor|chatgpt|claude|generic] [--dry-run]
```

## Setup local

```bash
npm install
```

## Execucao

Modo desenvolvimento (sem build):

```bash
npm run dev -- --help
npm run dev -- index . --dry-run
```

Build + execucao:

```bash
npm run build
npm run start -- --help
```

## Qualidade

```bash
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run quality
```

## Configuracao do projeto

O arquivo `graphmemo.config.json` e opcional. Para criar:

```bash
cp graphmemo.config.example.json graphmemo.config.json
```

Campos suportados:

- `docsDir`
- `knowledgeDir`
- `stateDir`
- `logLevel` (`debug`, `info`, `warn`, `error`)

## Estado atual

- Os comandos `index`, `context` e `import-chats` estao implementados como stubs.
- A estrutura foi preparada para crescimento incremental com separacao de responsabilidades.
- A logica real de indexacao/grafo/importacao/context builder sera implementada nas proximas tasks.
