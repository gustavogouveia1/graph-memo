# Decision: Scoring explicito para reduzir ruido no context builder (Task 9)

- tipo: #type/decision
- status: #status/done
- owner: engenharia
- data: 2026-04-15

## Problema

O pipeline anterior de relevancia usava pesos baixos e homogeneos, permitindo que termos genericos e arquivos amplos aparecessem com frequencia maior do que o desejado mesmo quando havia um arquivo dominante claro.

## Opcoes

- Opcao A: manter scoring simples com pequenos ajustes incrementais
- Opcao B: adotar pesos explicitos por categoria de sinal (forte, medio, penalidades) sem IA/embeddings

## Decisao tomada

Adotar opcao B com pesos deterministas e auditaveis:

- `+120` para match exato de simbolo
- `+100` para match exato de path
- `+80` para match exato de nome de arquivo
- `+60` para modulo exato
- `+40` para relacao estrutural por import/export
- `+25` para termo forte de dominio
- `-30` para arquivo generico sem relacao estrutural forte
- `-40` para arquivo acionado apenas por token fraco

Tambem foi decidido:

- remover abreviacoes automaticas fracas na extracao de termos
- tratar filtros `symbol`, `file` e `module` como sinais fortes separados da task textual
- enriquecer `fileRelations` com resolucao local/alias conservadora (`@/`, `~/`) quando o alvo existe no indice

## Impacto

- Tecnico: melhora coerencia de ranking sem alterar arquitetura de camadas
- Operacional: reduz ruido de arquivos genericos e melhora pontos iniciais sugeridos
- Evolucao: base pronta para ajustes incrementais futuros com mesma estrategia auditavel

## Relacoes

- [[Feature:Relevancia do context builder (Task 9)]]
- [[Decision:Pipeline deterministico de matching para context builder v1]]
- [[Decision:Camada de consulta separada com relacoes basicas in-memory]]
- [[ADR-001]]
- [[ADR-003]]
