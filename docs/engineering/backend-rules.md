# Regras de Back-end

## Design de API e aplicacao

- `MUST` expor contratos claros e versionados.
- `MUST` validar payload de entrada na fronteira.
- `MUST` retornar codigos HTTP coerentes com semantica do erro/sucesso.
- `MUST` manter handlers finos e logica no caso de uso.
- `SHOULD` usar idempotencia em operacoes de escrita repetiveis.

## Regras de dominio

- `MUST` centralizar invariantes de negocio no dominio.
- `MUST` rejeitar estado invalido o mais cedo possivel.
- `MUST` modelar erros de dominio com tipos explicitos.

## Confiabilidade e concorrencia

- `MUST` definir timeout para chamadas externas.
- `MUST` controlar retries com backoff e limite.
- `MUST` garantir comportamento deterministico em transacoes.
- `SHOULD` usar circuit breaker para dependencias instaveis.

## Integracoes externas

- `MUST` encapsular cliente externo em adapter dedicado.
- `MUST` mapear erros externos para erros internos padronizados.
- `MUST` registrar latencia e taxa de falha por integracao.

## Criterios auditaveis

- Endpoints com contrato documentado e testes de contrato.
- Nao existe regra de negocio em camada de transporte.
- Chamadas externas possuem timeout e tratamento de falha.
