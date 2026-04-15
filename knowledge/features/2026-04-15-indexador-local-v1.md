# Feature: Indexador local v1 do codebase

- tipo: #type/feature
- status: #status/done
- owner: engenharia
- risco: #risk/medium

## Problema de negocio

A CLI precisava sair de stubs e entregar o primeiro comportamento real do produto para gerar memoria estrutural local do projeto de forma simples e confiavel.

## Criterios de aceite

- Indexacao recursiva de diretório alvo com filtros por extensao suportada
- Exclusao de diretorios irrelevantes para reduzir ruido
- Persistencia local versionada em `.graphmemo/manifest.json` e `.graphmemo/files.json`
- Reindexacao completa (`--full`) e incremental simples
- Testes de unidade e integracao cobrindo fluxo principal

## Escopo tecnico

- Modulos afetados: `src/application/use-cases`, `src/application/ports`, `src/core/indexing`, `src/infrastructure/filesystem`, `src/infrastructure/parsing`, `src/infrastructure/persistence`, `src/cli`
- Contratos impactados: contrato interno de retorno da task `index`, portas de filesystem/parser/store
- Persistencia: JSON local em `.graphmemo/`

## Progresso

- [x] Descoberta
- [x] Desenho
- [x] Implementacao
- [x] Validacao
- [x] Operacao

## Relacoes

- [[Decision:Contrato inicial do indice local em JSON]]
- [[Feature:Bootstrap tecnico executavel da CLI]]
- [[ADR-001]]
