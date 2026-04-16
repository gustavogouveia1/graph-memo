# Estado Atual, Gaps e Evolucao Incremental

## Baseline atual do repositorio

O Graph-Memo ja possui uma base executavel e consistente para evolucao incremental:

- arquitetura em camadas aplicada entre CLI/Web, aplicacao, dominio e infraestrutura
- fluxo principal operacional com `index`, `query`, `context` e `import-chats`
- testes automatizados de unidade, integracao e E2E cobrindo o fluxo MVP+
- governanca tecnica ativa em `docs/engineering/`, ADRs versionadas e memoria viva em `knowledge/`
- gate local de qualidade com formatacao, lint, typecheck e testes

## Gaps reais de maturidade no estado atual

Apesar da base estar solida, ainda existem gaps objetivos de operacao e consistencia:

1. **Consistencia de configuracao**
   - `stateDir` precisa ser respeitado de ponta a ponta (persistencia, leitura e mensagens operacionais).
2. **Confiabilidade do gate local**
   - falhas de formatacao nao podem quebrar o gate de forma recorrente sem remediacao rapida.
3. **Automacao de qualidade no repositório**
   - sem CI minima, o controle de qualidade depende de execucao manual local.
4. **Alinhamento de documentacao de status**
   - documentos de estado devem refletir a realidade atual (nem subestimar, nem superestimar maturidade).

## Estrategia de evolucao sem ruptura

1. **Correcoes pequenas e rastreaveis**
   - priorizar mudancas localizadas, com contratos preservados e rollback simples.
2. **Qualidade como pre-condicao de merge**
   - manter `format:check`, `lint`, `typecheck` e `test` obrigatorios localmente e na CI.
3. **Documentacao viva acoplada a mudanca**
   - toda evolucao operacional relevante atualiza `README`, engenharia e notas em `knowledge/`.
4. **Sem reestruturacao ampla prematura**
   - evoluir por necessidade comprovada, evitando abstrações ou pipelines infladas.

## Regra de continuidade

- nenhuma refatoracao ampla sem baseline de testes valida
- nenhuma mudanca de contrato sem processo dedicado quando aplicavel
- decisoes relevantes devem permanecer registradas em ADR ou `knowledge/decisions/`
