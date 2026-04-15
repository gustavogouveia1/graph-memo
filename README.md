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
graphmemo query [targetPath] [--symbol <name>] [--file <relativePath>] [--module <source>] [--related-to <relativePath>] [--list-files]
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

### Comportamento atual do `query`

- Le o indice persistido em `.graphmemo/manifest.json` e `.graphmemo/files.json`
- Modela relacoes basicas e auditaveis:
  - `file_defines_symbol`
  - `file_imports_module`
  - `file_exports_symbol`
- Suporta consultas para:
  - encontrar arquivos por simbolo (`--symbol`)
  - listar detalhes de um arquivo (`--file`)
  - listar arquivos que importam um modulo (`--module`)
  - localizar relacoes de import/export por arquivo (`--related-to`)
  - listar todos os arquivos indexados (`--list-files`)
- Suporta match configuravel:
  - `--case-sensitive` / `--no-case-sensitive`
  - `--exact-match` / `--no-exact-match`
- Trata erros tipados para indice ausente/corrompido com instrucoes de recuperacao

Exemplos:

```bash
npm run dev -- query . --symbol runIndex
npm run dev -- query . --symbol service --no-case-sensitive --no-exact-match
npm run dev -- query . --file src/application/use-cases/run-index.use-case.ts
npm run dev -- query . --module "./register-index-command"
npm run dev -- query . --related-to src/cli/create-cli.ts
npm run dev -- query . --list-files
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

- O comando `index` esta implementado com persistencia local versionada em `.graphmemo/`.
- O comando `query` esta implementado para consulta estrutural do indice local.
- Os comandos `context` e `import-chats` permanecem como stubs.
- A estrutura segue preparada para evolucao incremental para grafo semantico, importacao de chats e context builder.
