# ADR-004: Autorizacao por Politicas de Acao e Recurso

- **Status:** Accepted
- **Data:** 2026-04-15
- **Autores:** Engenharia
- **Relacionados:** `docs/engineering/security-rules.md`

## Contexto

Autorizacao implícita por perfil amplo gera risco de escalacao de privilegio e baixa auditabilidade.

## Decisao

Adotar autorizacao por politica explicita:

- sujeito (quem)
- recurso (o que)
- acao (qual operacao)
- contexto (restricoes adicionais)

Com `deny-by-default`.

## Consequencias

### Positivas

- Menor superficie de acesso indevido.
- Regras de permissao claras e auditaveis.

### Negativas / Trade-offs

- Maior esforco inicial de modelagem de politicas.

## Alternativas consideradas

- Permissao apenas por role global: descartada por granularidade insuficiente.

## Plano de adocao

- Definir matriz acao/recurso por contexto de negocio.
- Implementar verificacao padronizada por endpoint/caso de uso.
