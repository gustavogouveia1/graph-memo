# Decision: Formato inicial das notas de importacao de chats

- tipo: #type/decision
- status: #status/done
- owner: engenharia
- data: 2026-04-15

## Problema

Definir um formato simples e previsivel para transformar exports heterogeneos de conversa em notas reutilizaveis no `knowledge/`, sem IA e sem acoplamento prematuro.

## Opcoes

- Opcao A: gerar resumo semantico e classificacao automatica rica
- Opcao B: normalizacao deterministica com metadados, mensagens brutas e links basicos

## Decisao tomada

Adotar opcao B:

- parser dedicado por provider (`claude`, `cursor`, `chatgpt`) com fallback para parser `generic`
- extracao minima obrigatoria: `provider`, `source_file`, `imported_at`, `topic`, `messages`, `timestamp` quando disponivel
- escrita em markdown em `knowledge/imports/` com secoes `Metadata`, `Messages` e `Related`
- sem deduplicacao avancada, sem embeddings e sem sumarizacao por IA nesta fase

## Impacto

- Tecnico: pipeline auditavel e testavel com fronteiras claras entre reader, normalizer e writer
- Operacional: notas previsiveis para consulta humana e indexacao futura
- Evolucao: base pronta para Task 5 (enriquecimento incremental de relacoes e contexto)

## Relacoes

- [[Feature:Ingestao de chats v1]]
- [[Decision:Stack inicial da CLI Graph-Memo]]
- [[ADR-001]]
