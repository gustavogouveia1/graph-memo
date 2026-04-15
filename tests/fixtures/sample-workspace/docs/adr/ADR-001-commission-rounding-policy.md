# ADR-001: Politica de arredondamento da comissao

- **Status:** Accepted
- **Data:** 2026-04-10

## Contexto

O calculo de comissao precisa ser previsivel para evitar divergencia entre preview e fechamento financeiro.

## Decisao

Aplicar arredondamento para duas casas decimais na fronteira da regra `calculateCommission`.

## Consequencias

- Mantem previsibilidade do valor exibido para o vendedor.
- Evita acumulacao de casas decimais em relatorios mensais.
