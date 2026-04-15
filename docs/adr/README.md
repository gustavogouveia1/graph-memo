# ADRs (Architecture Decision Records)

## Objetivo

Registrar decisoes tecnicas estruturais para manter contexto historico e evitar retrabalho.

## Quando criar ADR

- Mudanca de arquitetura entre modulos
- Escolha de padrao tecnico com trade-off relevante
- Mudanca de contrato ou estrategia de dados com impacto alto
- Decisao de seguranca que altera risco operacional

## Convencao

- Nome: `ADR-XXX-titulo-curto.md`
- Status: `Proposed`, `Accepted`, `Superseded`, `Deprecated`
- Uma decisao por ADR
- Referenciar tickets, PRs e notas no `knowledge/decisions/`

## Fluxo minimo

1. Criar ADR usando `ADR-000-template.md`
2. Revisar com responsavel tecnico
3. Aprovar e marcar como `Accepted`
4. Vincular implementacao e evidencias
5. Se substituida, criar nova ADR e marcar antiga como `Superseded`
