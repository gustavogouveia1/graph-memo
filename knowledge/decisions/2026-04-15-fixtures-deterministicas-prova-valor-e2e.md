# Decision: Fixtures deterministicas para prova de valor e2e

- tipo: #type/decision
- status: #status/done
- owner: engenharia
- data: 2026-04-15

## Problema

A validacao de ponta a ponta precisava ser repetivel e auditavel, sem depender do estado real do repositorio principal nem de rede externa.

## Opcoes

- Opcao A: executar E2E diretamente no workspace principal, com alto risco de flakiness por estado local
- Opcao B: usar fixture fechada e copiar para diretorio temporario a cada execucao de teste

## Decisao tomada

Adotar opcao B:

- fixture pequena, realista e versionada em `tests/fixtures/sample-workspace`
- teste E2E em `tests/e2e/cli-e2e-flow.test.ts` executando a sequencia oficial de comandos
- reset explicito para walkthrough manual via `npm run demo:reset`

## Impacto

- Tecnico: resultados estaveis e independentes do estado do projeto principal
- Operacional: demo local reproduzivel para onboarding e validacao de regressao
- Evolucao: base pronta para ampliar cobertura com cenarios de falha sem reestruturar a CLI

## Relacoes

- [[Feature:Validacao e2e do fluxo completo v1]]
- [[Decision:Pipeline deterministico de matching para context builder v1]]
- [[ADR-001]]
- [[ADR-003]]
