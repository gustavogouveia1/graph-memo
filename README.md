# Graph-Memo

Sistema local de memoria persistente e knowledge graph para desenvolvimento assistido por IA.

Este bootstrap entrega a base executavel da CLI em TypeScript, com arquitetura modular pronta para evoluir para indexacao, importacao de chats e context builder.
Agora tambem inclui uma Web UI minima local-first para operar os mesmos fluxos via HTTP, sem duplicar regra de negocio.

## Stack

- Node.js
- TypeScript
- CLI com `commander`
- API HTTP local (Node.js `http`)
- Web UI minima (HTML/CSS/JS)
- Lint com ESLint
- Formatacao com Prettier
- Testes com Vitest

## Estrutura inicial

```text
src/
  cli/              # entrada da aplicacao e comandos da CLI
  web/              # camada HTTP local + UI minima
  application/      # casos de uso e portas de aplicacao
  core/             # tipos e contratos centrais de dominio
  infrastructure/   # adaptadores concretos (ex.: logger)
  shared/           # configuracao, bootstrap e utilitarios compartilhados
tests/              # testes unitarios e de comportamento inicial
scripts/            # automacoes locais de qualidade
docs/               # governanca e ADRs
knowledge/          # memoria viva do projeto
```

## Comandos da CLI

```bash
graphmemo index [targetPath] [--full] [--dry-run]
graphmemo query [targetPath] [--symbol <name>] [--file <relativePath>] [--module <source>] [--related-to <relativePath>] [--list-files]
graphmemo context [targetPath] --task "<descricao>" [--format markdown|json] [--symbol <name>] [--file <relativePath>] [--module <source>] [--refine-with-claude]
graphmemo import-chats --source <path> [--provider cursor|chatgpt|claude|generic] [--dry-run]
```

> A CLI continua sendo a interface oficial. A Web UI e uma camada adicional de operacao para onboarding e demonstracao.

## API HTTP local + Web UI (Task 8)

### Como iniciar a UI

```bash
npm run dev:web
```

Padrao de porta: `3210` (localhost).  
Opcional: sobrescrever com `GRAPHMEMO_WEB_PORT`.

Exemplo:

```bash
GRAPHMEMO_WEB_PORT=4321 npm run dev:web
```

Abra no navegador:

- `http://127.0.0.1:3210`

### Endpoints HTTP locais

- `POST /api/index`
- `POST /api/query`
- `POST /api/import-chats`
- `POST /api/context`

Contrato de erro (padrao):

```json
{
  "error_code": "QUERY_INVALID_INPUT",
  "message": "Consulta invalida. Informe ao menos um filtro de busca: --symbol, --module, --file, --related-to ou --list-files.",
  "correlation_id": "6a18f70c-f9db-48d0-bb0b-4af36db625d7"
}
```

### Fluxo manual de demonstracao pela UI

1. Acesse a aba **Index**

- informe `workspace path` (ou clique em `Usar fixture demo`)
- opcional: marque `Dry-run` / `Full reindex`
- clique `Executar index`

2. Acesse a aba **Query**

- use o mesmo `workspace path`
- preencha ao menos um filtro (`symbol`, `module`, `file`, `related-to` ou `list-files`)
- clique `Executar query`

3. Acesse a aba **Import Chats**

- informe `workspace path` e `source path`
- selecione provider (`generic`, `claude`, `cursor`, `chatgpt`)
- clique `Importar chats`

4. Acesse a aba **Context Builder**

- informe `workspace path`
- preencha `task` e filtros opcionais (`symbol`, `module`)
- escolha formato (`markdown` ou `json`)
- opcional: habilite refinamento com Claude
- clique `Gerar contexto`
- use `Copiar resultado` para transferir o preview

### Comportamento atual do `index`

- Indexa recursivamente arquivos `.ts`, `.tsx`, `.js` e `.jsx`
- Ignora diretorios comuns nao relevantes (`node_modules`, `dist`, `build`, `coverage`, `.git` e o `stateDir` configurado)
- Extrai imports, exports e simbolos nomeados (funcoes e classes)
- Persiste manifest e lista de arquivos em `<stateDir>/manifest.json` e `<stateDir>/files.json` (default: `.graphmemo/`)
- Suporta `--full` para reindexacao completa e modo incremental por `mtime`/`size`/`hash`
- Suporta `--dry-run` para validar execucao sem gravar arquivos

### Comportamento atual do `query`

- Le o indice persistido em `<stateDir>/manifest.json` e `<stateDir>/files.json` (default: `.graphmemo/`)
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

### Troubleshooting (erros comuns)

Mensagens seguem o padrao `[CODIGO] descricao` no stderr. Abaixo, causas e recuperacao.

| Codigo                  | O que fazer                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `INDEX_NOT_FOUND`       | Rode `graphmemo index <caminho-do-projeto>` no diretorio que deve conter o `stateDir` configurado (default: `.graphmemo/`).              |
| `INDEX_CORRUPTED`       | Apague ou regenere o estado: `graphmemo index <caminho> --full`.                                                                         |
| `QUERY_INVALID_INPUT`   | Informe ao menos um filtro (`--symbol`, `--file`, `--module`, `--related-to` ou `--list-files`); valores de filtro nao podem ser vazios. |
| `CONTEXT_INVALID_INPUT` | Use `--task` com texto nao vazio; `--format` deve ser `markdown` ou `json`; filtros opcionais nao podem ser vazios.                      |
| `CHAT_SOURCE_NOT_FOUND` | Confira o caminho passado em `--source` (arquivo ou diretorio existente).                                                                |

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
- Extrai termos simples e deterministas sem IA/embeddings, com limpeza de ruido:
  - remove duplicatas
  - normaliza case/acentuacao
  - descarta tokens curtos fracos (mantendo termos curtos fortes como `csv`)
  - nao gera abreviacoes automaticas fracas
- Cruza task com:
  - indice estrutural persistido em `<stateDir>/` (default: `.graphmemo/`)
  - query layer local (simbolos, modulos, relacoes import/export)
  - notas em `knowledge/` (incluindo `knowledge/imports/`)
  - ADRs e regras em `docs/`
- Ranking estrutural/lexical explicito e auditavel:
  - peso alto para match exato de `symbol`, `file/path`, nome de arquivo e `module`
  - peso medio para relacoes estruturais por import/export e termos fortes de dominio
  - penalidade para arquivos genericos sem sinal estrutural e para match fraco
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
- Enriquece `fileRelations` com resolucao local de imports (`./`, `../`) e aliases comuns (`@/`, `~/`) quando o alvo existe no indice
- Suporta refinamento opcional via `--refine-with-claude`, preservando sempre o contexto deterministico bruto como fonte de verdade
- Em caso de Claude desativado, nao configurado, timeout ou erro upstream, o comando falha de forma suave e retorna apenas camada deterministica + status da tentativa de refinamento

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
- `<stateDir>/manifest.json` e `<stateDir>/files.json` gerados dentro da fixture (default: `.graphmemo/`)
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
npm run dev:web
```

Build + execucao:

```bash
npm run build
npm run start -- --help
npm run start:web
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
- `stateDir` (default: `.graphmemo`)
- `logLevel` (`debug`, `info`, `warn`, `error`)
- `aiRefinement.enabled` (boolean)
- `aiRefinement.apiKey` (string)
- `aiRefinement.model` (string, default `claude-3-5-sonnet-latest`)
- `aiRefinement.timeoutMs` (number, default `8000`)

Tambem e possivel configurar por variavel de ambiente:

- `GRAPHMEMO_AI_REFINEMENT_ENABLED` (`true|false`)
- `GRAPHMEMO_CLAUDE_API_KEY`
- `GRAPHMEMO_CLAUDE_MODEL`
- `GRAPHMEMO_CLAUDE_TIMEOUT_MS`

## Estado atual

- O comando `index` esta implementado com persistencia local versionada em `.graphmemo/`.
- O comando `query` esta implementado para consulta estrutural do indice local.
- O comando `import-chats` esta implementado para ingestao deterministica de exports de conversa em `knowledge/imports/`.
- O comando `context` esta implementado com context builder deterministico sobre indice + knowledge.
- A camada HTTP local e a Web UI minima operam os mesmos use cases da CLI sem duplicar regra de negocio.
- A CLI permanece como interface oficial; a Web UI e um caminho adicional para operacao e demonstracao local.
- Existe validacao E2E reproduzivel com fixture realista em `tests/fixtures/` cobrindo o fluxo completo da CLI.
- A estrutura segue preparada para evolucao incremental para heuristicas mais ricas e grafos de contexto.
