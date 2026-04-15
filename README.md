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
graphmemo context [targetPath] --task "<descricao>" [--format markdown|json] [--symbol <name>] [--file <relativePath>] [--module <source>]
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

### Comportamento atual do `import-chats`

- Le export de chat a partir de arquivo unico ou diretorio
- Providers suportados: `generic`, `claude`, `cursor`, `chatgpt`
- Usa parser dedicado por provider quando possivel
- Faz fallback seguro para parser `generic` quando parser dedicado nao reconhece o formato
- Normaliza para um modelo interno consistente com `provider`, `source_file`, `imported_at`, `topic`, `messages` e `timestamp` (quando houver)
- Gera notas markdown em `knowledge/imports/`
- Suporta `--dry-run` sem persistir arquivos

Exemplos:

```bash
npm run dev -- import-chats --source ./exports --provider cursor
npm run dev -- import-chats --source ./exports/chatgpt-export.json --provider chatgpt
npm run dev -- import-chats --source ./exports --provider claude --dry-run
```

### Comportamento atual do `context`

- Recebe task textual (`--task`) e filtros opcionais (`--symbol`, `--file`, `--module`)
- Extrai termos simples e deterministas sem IA/embeddings
- Cruza task com:
  - indice estrutural persistido em `.graphmemo/`
  - query layer local (simbolos, modulos, relacoes import/export)
  - notas em `knowledge/` (incluindo `knowledge/imports/`)
  - ADRs e regras em `docs/`
- Monta pacote consolidado com:
  - `Task`
  - `Relevant Files`
  - `Relevant Symbols`
  - `Relevant Modules`
  - `Relevant Knowledge Notes`
  - `Relevant ADRs/Docs`
  - `Suggested Starting Points`
- Suporta saida em `markdown` (default) ou `json`
- Suporta controle de matching:
  - `--case-sensitive` / `--no-case-sensitive`
  - `--exact-match` / `--no-exact-match`

Exemplos:

```bash
npm run dev -- context . --task "corrigir calculo de comissao"
npm run dev -- context . --task "corrigir calculo de comissao" --symbol calculateCommission
npm run dev -- context . --task "ajustar fluxo de indexacao incremental" --format json
npm run dev -- context . --task "refatorar parser de chatgpt" --module "./readers/chatgpt-chat-import-reader"
```

## Setup local

```bash
npm install
```

## Demo ponta a ponta (Task 6)

Fixture usada na validacao:

- `tests/fixtures/sample-workspace/`
- contem `src/` (TS/JS com relacoes reais), `chat-exports/`, `knowledge/` e `docs/`

### 1) Resetar artefatos da demo

```bash
npm run demo:reset
```

### 2) Indexar a fixture

```bash
npm run dev -- index tests/fixtures/sample-workspace
```

Saida esperada (resumo):

- status `SUCCESS`
- `.graphmemo/manifest.json` e `.graphmemo/files.json` gerados dentro da fixture
- `indexedFilesCount` maior que zero

### 3) Consultar simbolo no indice

```bash
npm run dev -- query tests/fixtures/sample-workspace --symbol calculateCommission
```

Saida esperada (resumo):

- `filesBySymbol` inclui `src/domain/commission-policy.ts`
- `exportsBySymbol` inclui `calculateCommission`

### 4) Importar chat para knowledge da fixture

```bash
npm run dev -- import-chats --source tests/fixtures/sample-workspace/chat-exports --provider generic
```

Saida esperada (resumo):

- status `SUCCESS`
- `persistedNotesCount` igual a `1`
- nota gerada em `tests/fixtures/sample-workspace/knowledge/imports/`

### 5) Construir contexto consolidado

```bash
npm run dev -- context tests/fixtures/sample-workspace --task "corrigir calculo de comissao premium" --format json
```

Saida esperada (resumo):

- `relevantFiles` inclui `src/domain/commission-policy.ts`
- `relevantKnowledgeNotes` inclui nota de `knowledge/features/` e nota em `knowledge/imports/`
- `relevantAdrsAndDocs` inclui ADR da fixture (`docs/adr/ADR-001-commission-rounding-policy.md`)

### 6) Executar o teste E2E automatizado

```bash
npm run test:e2e
```

O teste cria uma copia temporaria da fixture, executa `index -> query -> import-chats -> context` em sequencia e valida artefatos/resultados deterministas.

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
npm run test:e2e
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
- O comando `import-chats` esta implementado para ingestao deterministica de exports de conversa em `knowledge/imports/`.
- O comando `context` esta implementado com context builder deterministico sobre indice + knowledge.
- Existe validacao E2E reproduzivel com fixture realista em `tests/fixtures/` cobrindo o fluxo completo da CLI.
- A estrutura segue preparada para evolucao incremental para heuristicas mais ricas e grafos de contexto.
