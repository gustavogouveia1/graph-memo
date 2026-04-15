# Checklist Obrigatorio Antes de Concluir Task

## Gate de Engenharia

- [ ] Regras de arquitetura e seguranca atendidas
- [ ] Nao ha violacao de anti-padroes proibidos
- [ ] Mudanca possui escopo claro e rastreavel

## Gate de Qualidade

- [ ] Testes de unidade/integracao necessarios adicionados ou atualizados
- [ ] Teste de regressao criado para bugfix (quando aplicavel)
- [ ] Validacao de cenarios de erro executada

## Gate de Dados e Contratos

- [ ] Mudanca de schema/API seguiu processo dedicado
- [ ] Migracoes e rollback definidos (quando aplicavel)
- [ ] Contratos impactados versionados/comunicados

## Gate de Operacao

- [ ] Logs, metricas e traces adequados ao novo comportamento
- [ ] Alertas/runbooks atualizados quando necessario
- [ ] Avaliacao de impacto de performance registrada

## Gate de Conhecimento e Rastreio

- [ ] Commit(s) logicos com mensagem padronizada
- [ ] ADR criada/atualizada para decisao relevante
- [ ] Notas no `knowledge/` atualizadas (bug/feature/decisao/progresso)

## Gate Final

- [ ] Revisao tecnica realizada
- [ ] Criterios de aceite atendidos
- [ ] Plano de rollback conhecido pelo time
