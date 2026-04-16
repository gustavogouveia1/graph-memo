# Feature: Relevancia do context builder (Task 9)

- tipo: #type/feature
- status: #status/done
- owner: engenharia
- risco: #risk/medium

## Problema de negocio

O context builder encontrava o arquivo principal em varios cenarios, mas ainda trazia ruido elevado em `extractedTerms`, `relevantFiles` e `fileRelations`, reduzindo a utilidade pratica para inicio rapido de implementacoes.

## Criterios de aceite

- limpeza deterministica de termos (sem abreviacao fraca automatica)
- ranking explicito com pesos fortes para sinais estruturais exatos
- penalizacao explicita de ruido em arquivos genericos e tokens fracos
- enriquecimento util de `dependsOn` e `importedBy`
- preservacao da arquitetura atual (CLI/UI finas, use case orquestrador, matching/output separados)
- testes cobrindo novos criterios de relevancia

## Escopo tecnico

- Modulos afetados: `src/core/context`, `src/core/query`, `src/application/use-cases`, `tests/core`, `README.md`
- Contratos impactados: comportamento interno de extracao/ranking/relacoes do comando `context` (sem quebrar contrato externo)
- Persistencia: sem mudancas de schema em `.graphmemo/`

## Progresso

- [x] Descoberta
- [x] Desenho
- [x] Implementacao
- [x] Validacao
- [x] Operacao

## Relacoes

- [[Decision:Scoring explicito para reduzir ruido no context builder (Task 9)]]
- [[Feature:Context builder deterministico v1]]
- [[Decision:Pipeline deterministico de matching para context builder v1]]
- [[ADR-001]]
- [[ADR-003]]
