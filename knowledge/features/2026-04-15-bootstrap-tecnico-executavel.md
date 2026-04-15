# Feature: Bootstrap tecnico executavel da CLI

- tipo: #type/feature
- status: #status/done
- owner: engenharia
- risco: #risk/medium

## Problema de negocio

O repositorio possui governanca e memoria viva, mas ainda nao possui baseline executavel para iniciar implementacao do produto.

## Criterios de aceite

- Projeto Node.js + TypeScript executavel localmente
- CLI com comandos iniciais `index`, `context` e `import-chats`
- Base de lint, formatacao e testes funcionando
- Estrutura em camadas aderente a `ADR-001`

## Escopo tecnico

- Modulos afetados: `src/cli`, `src/application`, `src/core`, `src/infrastructure`, `src/shared`
- Contratos impactados: contrato interno dos comandos de CLI
- Dependencias: `commander`, `typescript`, `eslint`, `prettier`, `vitest`

## Progresso

- [x] Descoberta
- [x] Desenho
- [x] Implementacao
- [x] Validacao
- [x] Operacao

## Relacoes

- [[Flow:Bootstrap CLI]]
- [[Decision:Stack inicial da CLI Graph-Memo]]
- [[ADR-001]]
