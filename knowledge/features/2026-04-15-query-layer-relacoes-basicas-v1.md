# Feature: Query layer e relacoes basicas do indice local

- tipo: #type/feature
- status: #status/done
- owner: engenharia
- risco: #risk/medium

## Problema de negocio

Depois da indexacao local v1, faltava uma camada de consulta para transformar o indice em base inicial de knowledge graph consultavel pela CLI.

## Criterios de aceite

- Leitura segura do indice persistido em `.graphmemo/`
- Query layer separada da persistencia
- Relacoes estruturais iniciais: `file_defines_symbol`, `file_imports_module`, `file_exports_symbol`
- Consultas minimas para simbolos, imports, exports, detalhes de arquivo e relacoes basicas
- Cobertura de testes para comportamento principal e cenarios de erro
- README atualizado com exemplos de uso

## Escopo tecnico

- Modulos afetados: `src/core/query`, `src/application/use-cases`, `src/application/ports`, `src/infrastructure/persistence`, `src/cli`
- Contratos impactados: task `query`, reader dedicado para indice local, match options de consulta
- Persistencia: leitura de `.graphmemo/manifest.json` e `.graphmemo/files.json`

## Progresso

- [x] Descoberta
- [x] Desenho
- [x] Implementacao
- [x] Validacao
- [x] Operacao

## Relacoes

- [[Decision:Camada de consulta separada com relacoes basicas in-memory]]
- [[Feature:Indexador local v1 do codebase]]
- [[ADR-001]]
- [[ADR-003]]
