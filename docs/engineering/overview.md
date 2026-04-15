# Governanca Tecnica do Projeto

Este diretorio define regras obrigatorias para evolucao do sistema com qualidade, seguranca e rastreabilidade.
As regras sao normativas: `MUST` (obrigatorio), `SHOULD` (recomendado forte), `MAY` (opcional controlado).

## Objetivos

- Padronizar implementacoes para reduzir variabilidade entre contribuidores humanos e IA.
- Garantir previsibilidade arquitetural, seguranca e desempenho em escala.
- Aumentar auditabilidade de mudancas, incidentes e decisoes tecnicas.
- Preservar contexto tecnico em memoria viva (ADR + vault local).

## Escopo

Estas regras se aplicam a:

- Novas features
- Correcao de bugs
- Refatoracoes
- Mudancas de schema de banco
- Mudancas de contratos de API
- Alteracoes de observabilidade e operacao

## Hierarquia de fontes

Em caso de conflito, seguir esta ordem:

1. `docs/engineering/security-rules.md`
2. `docs/engineering/architecture-rules.md`
3. Regras de dominio especificas (`backend`, `frontend`, `database`, `testing`, `observability`)
4. Processos (`feature`, `bugfix`, `api-schema-change`, `refactoring`)
5. `docs/engineering/code-style-rules.md`

## Definicao de conformidade

Uma task so e considerada concluida quando:

- atende `docs/engineering/definition-of-done.md`
- nao viola `docs/engineering/anti-patterns.md`
- possui rastreabilidade de decisao e mudanca
- atualiza documentacao viva quando altera comportamento

## Fluxo obrigatorio para IA antes de codar

Toda IA assistente MUST executar:

1. Ler `docs/engineering/overview.md`
2. Ler regras do dominio afetado
3. Ler processo da mudanca (`feature`, `bugfix` ou `api-schema-change`)
4. Ler contexto no vault (`knowledge/*`) por tags e wikilinks relevantes
5. Verificar ADRs ativos em `docs/adr`
6. Planejar mudanca com criterios de aceite e rollback
7. Codar somente apos validar os passos acima

## Politica de excecao

Excecoes sao permitidas somente com:

- justificativa tecnica escrita
- aprovacao explicita de responsavel tecnico
- registro de compensacoes e prazo de remediacao
- ADR ou nota de decisao vinculada
