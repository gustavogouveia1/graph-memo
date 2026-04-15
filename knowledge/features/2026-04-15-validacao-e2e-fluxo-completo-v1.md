# Feature: Validacao e2e do fluxo completo v1

- tipo: #type/feature
- status: #status/done
- owner: engenharia
- risco: #risk/medium

## Problema de negocio

As Tasks 1-5 entregaram componentes tecnicos funcionais, mas faltava provar valor do produto de ponta a ponta com um fluxo demonstravel e reproduzivel.

## Criterios de aceite

- Fixture realista de projeto pequeno em `tests/fixtures/`
- Fixture de chat exportado para ingestao
- Teste E2E cobrindo `index`, `query`, `import-chats` e `context`
- Comandos validando artefatos e sinais de contexto util
- README com walkthrough completo da demo local

## Escopo tecnico

- Modulos afetados: `tests/e2e`, `tests/fixtures`, `README.md`, `package.json`, `scripts`
- Contratos impactados: fluxo CLI existente (sem quebra de interface)
- Persistencia: geracao de `.graphmemo/` e `knowledge/imports/` dentro da fixture

## Progresso

- [x] Descoberta
- [x] Desenho
- [x] Implementacao
- [x] Validacao
- [x] Operacao

## Relacoes

- [[Decision:Fixtures deterministicas para prova de valor e2e]]
- [[Feature:Context builder deterministico v1]]
- [[Feature:Ingestao de chats v1]]
- [[ADR-001]]
- [[ADR-003]]
