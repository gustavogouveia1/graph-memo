# Decision: Corrigir bonus de comissao por faixa

- tipo: #type/decision
- status: #status/done
- owner: equipe-fixture
- data: 2026-04-10

## Problema

O bonus de comissao para vendas acima de 8_000 precisa ser aplicado de forma clara e rastreavel.

## Decisao tomada

Manter bonus explicito em `commission-policy.ts` com taxa separada de `baseRate`.

## Relacoes

- [[Feature:Ajuste da comissao premium]]
- [[ADR-001]]
