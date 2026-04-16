# Decision: stateDir real e CI minima obrigatoria

- tipo: #type/decision
- status: #status/done
- owner: engenharia
- data: 2026-04-16

## Problema

O repositorio tinha baseline funcional, mas ainda com dois gaps operacionais relevantes:

- `stateDir` era exposto em configuracao, porem persistencia/leitura do indice mantinham hardcode em `.graphmemo`
- qualidade dependia apenas de execucao manual local, sem CI minima em `push` e `pull_request`

## Decisao tomada

1. Centralizar resolucao de paths do indice em util unico (`state-index-paths`) e injetar `stateDir` no bootstrap.
2. Remover hardcode de `.graphmemo` na persistencia/query e usar default apenas via configuracao.
3. Criar workflow de CI minimo com `format:check`, `lint`, `typecheck` e `test`.

## Impacto

- Tecnico: contrato de configuracao fica coerente com comportamento real de runtime.
- Operacional: merge passa a ser protegido por gate automatizado de qualidade.
- Evolucao: mantem arquitetura em camadas sem espalhar leitura de config por infra/aplicacao.

## Relacoes

- [[Feature:Indexador local v1 do codebase]]
- [[Feature:Query layer e relacoes basicas do indice local]]
- [[ADR-001]]
