# Processo para Alterar Schema e Contratos de API

## Escopo

Aplica-se a:

- migracoes de banco
- mudanca de payload/request/response
- mudanca de semantica de endpoint/evento
- alteracoes em contratos consumidos por terceiros

## Regras obrigatorias

- `MUST` classificar a mudanca como compativel ou com quebra.
- `MUST` definir estrategia de transicao (expand/contract quando possivel).
- `MUST` versionar contrato com quebra (`v2`, novo evento, novo campo obrigatorio controlado).
- `MUST` publicar plano de migracao para consumidores.
- `MUST` definir rollback de dados e de contrato.

## Sequencia recomendada (expand/contract)

1. Expandir: adicionar novo campo/estrutura sem remover o antigo.
2. Publicar consumidores com leitura dual.
3. Migrar/backfill de dados quando necessario.
4. Validar metricas de adocao e erro.
5. Contrair: remover legado apos janela de seguranca.

## Checklist de mudanca de contrato

- [ ] Tipo da mudanca classificado (compativel/quebra)
- [ ] ADR criada ou atualizada
- [ ] Consumidores mapeados e comunicados
- [ ] Testes de contrato atualizados
- [ ] Plano de rollout e rollback aprovado
