# Regras de Refatoracao Segura

## Principios

- `MUST` refatorar sem alterar comportamento funcional esperado.
- `MUST` ter baseline de testes antes de refatorar area critica.
- `MUST` dividir refatoracao grande em etapas pequenas e revisaveis.
- `MUST` registrar risco e plano de rollback.

## Estrategia recomendada

1. Cobrir comportamento atual com testes de caracterizacao.
2. Isolar mudanca estrutural sem alterar contrato externo.
3. Executar testes e comparacao de desempenho.
4. Remover codigo legado apenas apos validacao.

## Regras operacionais

- `MUST` evitar mistura de refatoracao extensa com nova feature no mesmo PR.
- `MUST` manter compatibilidade temporaria quando houver consumidores legados.
- `SHOULD` usar feature flag para transicao de fluxo critico.

## Criterios auditaveis

- PR de refatoracao identifica claramente escopo nao funcional.
- Existe evidencia de testes antes e depois.
- Nao houve alteracao de contrato sem seguir processo de schema/API.
