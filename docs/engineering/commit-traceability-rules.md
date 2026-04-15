# Regras de Commits Logicos e Rastreabilidade

## Principios

- `MUST` cada commit representar uma unidade logica de mudanca.
- `MUST` commit descrever intencao e motivo, nao apenas arquivo alterado.
- `MUST` vincular commit/PR a bug, feature ou decisao.
- `MUST` evitar commits gigantes sem coerencia tematica.

## Estrutura recomendada de mensagem

Formato:

`<tipo>(<escopo>): <resumo>`

Tipos sugeridos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `security`.

Exemplo:

`fix(auth): bloquear refresh token revogado por blacklist`

## Regras operacionais

- `MUST` separar alteracao mecanica de alteracao comportamental quando possivel.
- `MUST` incluir mudanca de teste no mesmo commit da mudanca funcional correlata.
- `MUST` atualizar documentacao viva quando alterar contrato/regra.
- `MUST NOT` misturar hotfix urgente com refatoracao ampla no mesmo commit.

## Criterios auditaveis

- Historico permite reconstruir o motivo de cada mudanca.
- Commits possuem escopo coerente e revisavel.
- Todo bug relevante tem commit associado.
