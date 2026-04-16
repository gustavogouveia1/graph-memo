# Feature: Web UI minima local-first para operacao do Graph-Memo

- tipo: #type/feature
- status: #status/done
- owner: engenharia
- risco: #risk/medium

## Problema de negocio

A CLI ja entrega os fluxos principais, mas usuarios iniciantes ainda tem friccao para descobrir comandos e combinar opcoes corretamente em demonstracoes do produto.

## Criterios de aceite

- Camada HTTP fina reaproveitando os use cases existentes (`index`, `query`, `import-chats`, `context`)
- UI web minima e profissional para executar os quatro fluxos
- Exibicao consistente de loading, sucesso, vazio e erro em cada secao
- Reaproveitamento dos codigos e mensagens de erro padronizados (`GraphMemoError`)
- Sem banco, autenticacao ou dependencia externa obrigatoria
- README atualizado com instrucoes e fluxo manual pela UI

## Escopo tecnico

- Modulos afetados: `src/web`, `src/shared/bootstrap`, `src/cli`, `src/application/use-cases`, `tests/e2e`
- Contratos impactados: API HTTP local (camada de transporte) e bootstrap compartilhado de runtime
- Persistencia: reutiliza os mesmos artefatos locais (`.graphmemo/`, `knowledge/`)

## Progresso

- [x] Descoberta
- [x] Desenho
- [x] Implementacao
- [x] Validacao
- [x] Operacao

## Relacoes

- [[Decision:Camada HTTP fina e UI minima sobre use cases]]
- [[Feature:Context builder deterministico v1]]
- [[Feature:Ingestao de chats v1]]
- [[ADR-001]]
- [[ADR-003]]
