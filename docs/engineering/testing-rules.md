# Regras de Testes

## Estrategia de cobertura

- `MUST` manter piramide de testes: unidade > integracao > e2e.
- `MUST` todo bug corrigido deve incluir teste de regressao.
- `MUST` toda regra de negocio critica deve ter teste de unidade.
- `MUST` contratos de API relevantes devem ter teste de contrato.

## Qualidade do teste

- `MUST` testes serem deterministas e independentes.
- `MUST` evitar dependencia de horario real, rede externa e estado global sem isolamento.
- `MUST` nomear cenarios com intencao de negocio.
- `MUST` validar comportamento observavel, nao implementacao interna.

## Dados de teste

- `MUST` usar factories/fixtures reutilizaveis.
- `MUST` anonimizar qualquer dado real utilizado em ambiente de teste.
- `SHOULD` usar seed minima para cenarios de integracao.

## Gates de entrega

- `MUST` pipeline bloquear merge em falha de testes obrigatorios.
- `MUST` cobertura minima definida por modulo (nao apenas global).
- `SHOULD` monitorar flakiness e corrigir antes de ampliar suite.

## Criterios auditaveis

- PR com alteracao funcional sem testes e automaticamente rejeitado.
- Correcoes de bug possuem teste de regressao vinculado ao ticket.
- Suites criticas executam em pipeline principal.
