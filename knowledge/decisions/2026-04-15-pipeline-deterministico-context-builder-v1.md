# Decision: Pipeline deterministico de matching para context builder v1

- tipo: #type/decision
- status: #status/done
- owner: engenharia
- data: 2026-04-15

## Problema

Era necessario construir contexto util sem LLM, embeddings ou heuristica opaca, preservando auditabilidade e previsibilidade para longo prazo.

## Opcoes

- Opcao A: introduzir busca semantica/embeddings para ganho de recall inicial
- Opcao B: adotar pipeline deterministico em duas fases (estrutural + memoria) com scoring explicito e limites fixos

## Decisao tomada

Adotar opcao B:

- extracao de termos simples por tokenizacao e filtro de ruido
- matching estrutural com `LocalIndexQueryLayer` e indice local persistido
- matching de memoria por score explicito em markdown (`knowledge/`, `docs/adr/`, `docs/engineering/`)
- montagem final em pacote fixo com secoes previsiveis e limites por categoria

## Impacto

- Tecnico: aumenta confiabilidade operacional sem acoplamento a IA externa
- Operacional: reduz retrabalho de descoberta inicial em tarefas de implementacao
- Evolucao: prepara base para Task 6 com refinamentos incrementais sem quebrar contrato de CLI

## Relacoes

- [[Feature:Context builder deterministico v1]]
- [[Decision:Camada de consulta separada com relacoes basicas in-memory]]
- [[Decision:Formato inicial das notas de importacao de chats]]
- [[ADR-001]]
- [[ADR-003]]
