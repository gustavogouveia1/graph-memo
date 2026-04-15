# ADR-003: Estrategia Padrao de Tratamento de Erros

- **Status:** Accepted
- **Data:** 2026-04-15
- **Autores:** Engenharia
- **Relacionados:** `docs/engineering/error-handling-rules.md`, `docs/engineering/observability-rules.md`

## Contexto

Sem padronizacao, erros viram ruido operacional e dificultam automacao de suporte/monitoramento.

## Decisao

- Classificar erros em categorias padrao.
- Retornar payload uniforme para clientes externos.
- Correlacionar erro por `correlation_id`.
- Nao expor stack trace externamente.

## Consequencias

### Positivas

- Diagnostico mais rapido.
- Melhor qualidade de alertas e suporte.

### Negativas / Trade-offs

- Necessidade de mapear excecoes legadas para padrao unico.

## Alternativas consideradas

- Erro livre por modulo: descartada por baixa previsibilidade.

## Plano de adocao

- Introduzir middleware/interceptor global de erros.
- Migrar respostas legadas por dominio de API.
