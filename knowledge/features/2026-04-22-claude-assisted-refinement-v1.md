# Feature: Claude-assisted refinement v1

- tipo: #type/feature
- status: #status/done
- owner: engenharia
- risco: #risk/medium

## Problema de negocio

O pacote de contexto deterministico do Graph-Memo e auditavel, mas pode ser verboso para uso imediato em assistentes de codificacao.

## Criterios de aceite

- Refinamento por IA e opcional e explicitamente habilitado
- Contexto deterministico segue como fonte de verdade em toda resposta
- Falhas de Claude nao quebram fluxo principal de `context`
- Saida refinada retorna contrato estruturado para resumo e pacote de prompt
- Configuracao por `graphmemo.config.json` e variaveis de ambiente

## Escopo tecnico

- Modulos afetados: `src/application`, `src/infrastructure`, `src/shared`, `src/cli`, `src/web`, `tests`
- Contratos impactados: comando `context`, `RuntimeServices`, contrato de configuracao
- Integracao externa: adapter HTTP dedicado para Claude (`Anthropic Messages API`)

## Progresso

- [x] Descoberta
- [x] Desenho
- [x] Implementacao
- [x] Validacao
- [x] Operacao

## Relacoes

- [[Decision:Refinamento IA opcional sobre contexto deterministico]]
- [[Feature:Context builder deterministico v1]]
- [[Decision:Pipeline deterministico de matching para context builder v1]]
- [[ADR-001]]
- [[ADR-003]]
