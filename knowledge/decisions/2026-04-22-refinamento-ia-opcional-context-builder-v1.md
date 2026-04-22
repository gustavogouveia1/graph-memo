# Decision: Refinamento IA opcional sobre contexto deterministico

- tipo: #type/decision
- status: #status/done
- owner: engenharia
- data: 2026-04-22

## Problema

Era necessario melhorar legibilidade e utilidade operacional do output do `context` sem mover retrieval/ranking para IA e sem acoplar o produto a um provider externo.

## Opcoes

- Opcao A: substituir etapa de montagem de contexto por chamada LLM
- Opcao B: manter pipeline deterministico atual e adicionar camada opcional de refinamento pos-processamento

## Decisao tomada

Adotar opcao B:

- contexto deterministico permanece fonte de verdade
- refinamento por Claude via porta de aplicacao + adapter de infraestrutura
- ativacao explicita por flag (`--refine-with-claude` / `refineWithClaude`) e config `aiRefinement`
- fallback suave para `disabled`, `not configured`, timeout ou falha upstream
- contrato de saida com duas camadas: `deterministicContext` + `refinement`

## Impacto

- Tecnico: preserva auditabilidade e baixo acoplamento da arquitetura em camadas
- Produto: melhora clareza de resumo/brief/prompt para desenvolvimento assistido
- Operacional: adiciona dependencia externa apenas quando a feature e habilitada

## Relacoes

- [[Feature:Claude-assisted refinement v1]]
- [[Feature:Context builder deterministico v1]]
- [[Decision:Pipeline deterministico de matching para context builder v1]]
- [[ADR-001]]
- [[ADR-003]]
