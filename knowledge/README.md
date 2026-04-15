# Knowledge Vault (Memoria Persistente)

Este diretorio e a memoria operacional do projeto para humanos e IA.

## Estrutura

- `knowledge/atomic-notes/`: notas pequenas, unicas e linkaveis.
- `knowledge/bugs/`: registros de incidentes e correcoes.
- `knowledge/decisions/`: decisoes taticas e links para ADR.
- `knowledge/features/`: especificacoes e progresso de features.
- `knowledge/entities/`: conceitos de dominio e relacionamentos.
- `knowledge/flows/`: fluxos de negocio e operacionais.
- `knowledge/glossary/`: vocabulario oficial do projeto.

## Convencoes de nota atomica

- Um conceito por arquivo.
- Nome de arquivo: `YYYY-MM-DD-slug-curto.md`.
- Cada nota MUST conter:
  - contexto
  - afirmacao principal
  - evidencias/links
  - proximos passos
  - tags
  - wikilinks

## Tags recomendadas

- `#type/bug`, `#type/feature`, `#type/decision`, `#type/entity`, `#type/flow`
- `#status/new`, `#status/in-progress`, `#status/done`, `#status/blocked`
- `#risk/low`, `#risk/medium`, `#risk/high`
- `#domain/backend`, `#domain/frontend`, `#domain/data`, `#domain/security`

## Wikilinks recomendados

- `[[Feature:Nome]]`
- `[[Bug:ID-ou-slug]]`
- `[[Decision:Titulo]]`
- `[[Entity:Nome]]`
- `[[Flow:Nome]]`
- `[[ADR-XXX]]`

## Fluxo de registro (obrigatorio)

1. Abrir nota de `feature` ou `bug`.
2. Vincular entidades e fluxos afetados por wikilink.
3. Registrar decisao tecnica em `knowledge/decisions/`.
4. Se decisao estrutural, criar/atualizar ADR.
5. Atualizar progresso no mesmo conjunto de notas ate conclusao.

## Protocolo para IA consultar contexto

Antes de codar, a IA MUST:

1. Ler nota primaria da task (`feature` ou `bug`).
2. Navegar wikilinks para `entities`, `flows`, `decisions`.
3. Confirmar aderencia com `docs/engineering/*`.
4. Verificar ADRs relacionadas.
5. Registrar novos aprendizados ao finalizar.
