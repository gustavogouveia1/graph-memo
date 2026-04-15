# Feature: Context builder deterministico v1

- tipo: #type/feature
- status: #status/done
- owner: engenharia
- risco: #risk/medium

## Problema de negocio

As tasks perdiam contexto entre execucoes e exigiam retrabalho manual para localizar arquivos, simbolos, notas e decisoes antes de implementar mudancas.

## Criterios de aceite

- Comando `context` recebe task textual com filtros opcionais (`symbol`, `file`, `module`)
- Matching estrutural usando indice local + query layer existente
- Matching de memoria usando `knowledge/`, `knowledge/imports/`, `docs/adr/` e `docs/engineering/`
- Saida curta, previsivel e deterministica em `markdown` e `json`
- Limites e ordenacao estavel para evitar excesso de contexto
- Testes cobrindo cenarios simples e ruidosos

## Escopo tecnico

- Modulos afetados: `src/cli`, `src/application/use-cases`, `src/core/context`, `src/infrastructure/knowledge`, `tests`
- Contratos impactados: comando `context`, `BuildContextUseCase`, porta de leitura de conhecimento
- Persistencia: reutiliza `.graphmemo/` para indice e leitura de markdown em `knowledge/` e `docs/`

## Progresso

- [x] Descoberta
- [x] Desenho
- [x] Implementacao
- [x] Validacao
- [x] Operacao

## Relacoes

- [[Decision:Pipeline deterministico de matching para context builder v1]]
- [[Feature:Query layer e relacoes basicas do indice local]]
- [[Feature:Ingestao de chats v1]]
- [[ADR-001]]
- [[ADR-003]]
