# Regras de Tratamento de Erros

## Principios

- `MUST` classificar erro em: validacao, dominio, integracao, infraestrutura, inesperado.
- `MUST` retornar resposta consistente ao cliente.
- `MUST` preservar causa raiz internamente para diagnostico.
- `MUST` falhar de forma segura (sem expor detalhe sensivel).

## Padrao de resposta

- `MUST` padronizar payload de erro com codigo interno, mensagem segura e `correlation_id`.
- `MUST` mapear excecoes para codigos HTTP corretos.
- `MUST NOT` retornar stack trace para cliente externo.

## Tratamento interno

- `MUST` capturar erro em fronteiras de I/O e transporte.
- `MUST` nao suprimir excecoes sem log e contexto.
- `SHOULD` envolver erro tecnico em erro de dominio quando necessario.

## Exemplo objetivo

Resposta padrao:

```json
{
  "error_code": "USER_NOT_FOUND",
  "message": "Usuario nao encontrado.",
  "correlation_id": "req-1234"
}
```

## Criterios auditaveis

- Todas as rotas seguem contrato unico de erro.
- Nao ha `catch` vazio.
- Logs de erro incluem contexto minimo de diagnostico.
