# Regras de Banco de Dados e Performance

## Modelagem e consistencia

- `MUST` modelar entidades com chaves e restricoes explicitas.
- `MUST` definir integridade referencial quando aplicavel.
- `MUST` tratar soft delete com criterio claro de consulta.
- `SHOULD` preferir tipos de dados adequados ao dominio, evitando campos genericos.

## Migracoes

- `MUST` toda alteracao de schema ser feita por migracao versionada.
- `MUST` migracao ser reversivel quando tecnicamente viavel.
- `MUST` separar mudanca estrutural de backfill pesado.
- `MUST` validar impacto em volume realista antes de producao.

## Queries e indices

- `MUST` evitar `SELECT *` em caminhos criticos.
- `MUST` indexar filtros e joins frequentes com base em planos reais.
- `MUST` revisar plano de execucao para queries lentas.
- `SHOULD` limitar pagina por cursor ou offset com teto.

## Performance e operacao

- `MUST` definir SLO de latencia para operacoes criticas.
- `MUST` monitorar throughput, lock, deadlock e latencia p95/p99.
- `MUST` usar transacao apenas no escopo minimo necessario.

## Criterios auditaveis

- Toda mudanca de schema possui migracao e plano de rollback.
- Queries criticas documentadas com indice associado.
- Nenhuma alteracao de schema entra sem teste em ambiente representativo.
