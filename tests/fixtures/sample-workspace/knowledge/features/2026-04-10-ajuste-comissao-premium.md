# Feature: Ajuste da comissao premium

- tipo: #type/feature
- status: #status/in-progress
- owner: equipe-fixture
- risco: #risk/medium

## Problema de negocio

Vendedores premium reportaram divergencia no calculo de comissao em vendas de alto valor.

## Criterios de aceite

- Validar o calculo em `calculateCommission`
- Garantir arredondamento monetario consistente
- Atualizar fluxo de analise em `knowledge/`

## Relacoes

- [[Decision:Politica de arredondamento da comissao]]
- [[ADR-001]]
