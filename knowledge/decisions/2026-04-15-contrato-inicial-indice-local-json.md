# Decision: Contrato inicial do indice local em JSON

- tipo: #type/decision
- status: #status/done
- owner: engenharia
- data: 2026-04-15

## Problema

Definir uma forma simples, auditavel e evolutiva de persistir o resultado da indexacao local sem introduzir banco ou infraestrutura complexa na fase inicial.

## Opcoes

- Opcao A: banco local (SQLite/embedded graph), melhor para consultas avancadas mas maior custo de operacao agora
- Opcao B: arquivos JSON versionados em `.graphmemo/`, menor custo inicial e facil inspecao manual

## Decisao tomada

Adotar persistencia em arquivos JSON com contrato minimo:

- `.graphmemo/manifest.json` com `schemaVersion`, `generatedAt`, `rootPath`, `indexedFilesCount`, `supportedExtensions`
- `.graphmemo/files.json` com `relativePath`, `extension`, `size`, `mtimeMs`, `hash`, `imports`, `exports`, `symbols`

## Impacto

- Tecnico: viabiliza indexacao incremental e replay simples sem acoplamento a banco
- Operacional: facilita debug e inspeção local do estado indexado
- Evolucao: permite migracao futura para grafo mais rico preservando `schemaVersion`

## Relacoes

- [[Feature:Indexador local v1 do codebase]]
- [[ADR-001]]
