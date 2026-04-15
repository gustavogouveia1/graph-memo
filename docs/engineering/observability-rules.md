# Regras de Logs e Observabilidade

## Logs estruturados

- `MUST` usar logs estruturados em formato consistente.
- `MUST` incluir `timestamp`, `level`, `service`, `operation`, `correlation_id`.
- `MUST` mascarar dados sensiveis.
- `MUST NOT` usar log verboso em loop critico sem controle.

## Metricas

- `MUST` monitorar RED para APIs (Rate, Errors, Duration).
- `MUST` monitorar USE para recursos (Utilization, Saturation, Errors) quando aplicavel.
- `MUST` definir SLI/SLO para fluxos de negocio criticos.

## Tracing

- `MUST` propagar `trace_id` entre servicos.
- `SHOULD` instrumentar operacoes externas (DB, HTTP, fila).
- `MUST` permitir correlacao entre log, metrica e trace.

## Alertas

- `MUST` alertar por sintoma de usuario (erro alto, latencia alta, indisponibilidade), nao apenas por recurso.
- `MUST` evitar alerta sem acao definida.
- `MUST` cada alerta critico ter runbook associado.

## Criterios auditaveis

- Requisicao critica pode ser rastreada ponta a ponta por `correlation_id`.
- Dashboards possuem p95/p99, taxa de erro e volume.
- Alertas criticos possuem dono e procedimento de resposta.
