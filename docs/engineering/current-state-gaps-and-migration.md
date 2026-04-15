# Estado Atual, Conflitos e Migracao sem Ruptura

## Conflitos encontrados no estado atual

Como o repositorio esta vazio, nao ha conflito de implementacao com boas praticas de codigo.
Porem, ha conflitos de maturidade para um projeto serio:

- ausencia de baseline de arquitetura executavel
- ausencia de testes automatizados
- ausencia de padrao de observabilidade operacional
- ausencia de historico de decisoes (ADR) e memoria viva

## Plano de migracao sem ruptura (quando o codigo iniciar/evoluir)

1. **Fase 1 - Guardrails imediatos**
   - Aplicar esta governanca em todas as novas tasks.
   - Bloquear entrega sem DoD e sem testes minimos.
2. **Fase 2 - Padronizacao progressiva**
   - Introduzir estrutura de camadas por modulo novo.
   - Adaptar modulos legados por prioridade de risco.
3. **Fase 3 - Endurecimento de qualidade**
   - Ativar gates de CI para teste, seguranca e lint.
   - Exigir rastreabilidade completa de bug/feature/decisao.
4. **Fase 4 - Operacao confiavel**
   - Consolidar SLOs, alertas e runbooks.
   - Revisar anti-padroes recorrentes trimestralmente.

## Regra de transicao

- Nenhuma refatoracao massiva sem testes de caracterizacao.
- Nenhuma quebra de contrato sem processo de schema/API.
- Mudancas de alto risco devem usar rollout controlado e rollback definido.
