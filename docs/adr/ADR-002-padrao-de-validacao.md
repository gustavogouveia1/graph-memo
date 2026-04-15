# ADR-002: Padrao de Validacao na Fronteira + Invariantes no Dominio

- **Status:** Accepted
- **Data:** 2026-04-15
- **Autores:** Engenharia
- **Relacionados:** `docs/engineering/backend-rules.md`, `docs/engineering/error-handling-rules.md`

## Contexto

Falhas de validacao tardia aumentam risco de estado inconsistente e mensagens de erro imprevisiveis.

## Decisao

- Validar sintaxe e shape de dados na fronteira de entrada.
- Validar invariantes de negocio no dominio.
- Padronizar retorno de erro com `error_code` e `correlation_id`.

## Consequencias

### Positivas

- Erros previsiveis para cliente e operacao.
- Protecao antecipada contra dados invalidos.

### Negativas / Trade-offs

- Duas camadas de validacao exigem disciplina de manutencao.

## Alternativas consideradas

- Validar apenas no banco: descartada por resposta tardia e baixa clareza.
- Validar apenas no front-end: descartada por inseguranca.

## Plano de adocao

- Aplicar padrao em todos os novos endpoints.
- Adaptar endpoints legados por prioridade de risco.
