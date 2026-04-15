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

## Comandos da CLI

```bash
graphmemo index [targetPath] [--full] [--dry-run]
graphmemo context --task <taskId> [--format markdown|json]
graphmemo import-chats --source <path> [--provider cursor|chatgpt|claude|generic] [--dry-run]
```

### Comportamento atual do `index`

- Indexa recursivamente arquivos `.ts`, `.tsx`, `.js` e `.jsx`
- Ignora diretorios comuns nao relevantes (`node_modules`, `dist`, `build`, `coverage`, `.git`, `.graphmemo`)
- Extrai imports, exports e simbolos nomeados (funcoes e classes)
- Persiste manifest e lista de arquivos em `.graphmemo/manifest.json` e `.graphmemo/files.json`
- Suporta `--full` para reindexacao completa e modo incremental por `mtime`/`size`/`hash`
- Suporta `--dry-run` para validar execucao sem gravar arquivos

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

- O comando `index` esta implementado com persistencia local versionada em `.graphmemo/`.
- Os comandos `context` e `import-chats` permanecem como stubs.
- A estrutura segue preparada para evolucao incremental para grafo semantico, importacao de chats e context builder.
