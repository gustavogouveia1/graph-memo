# Decisao: camada HTTP fina e UI minima sobre use cases

- tipo: #type/decision
- status: #status/done
- owner: engenharia
- data: 2026-04-15

## Problema

Adicionar uma interface web para operacao local do Graph-Memo sem duplicar regras da CLI e sem introduzir arquitetura web pesada.

## Opcoes

- Opcao A: frontend React/Vite separado com backend dedicado e contratos extensos
- Opcao B: servidor HTTP Node/TypeScript minimalista com UI local unica (sem build de frontend dedicado)

## Decisao tomada

Adotar a opcao B com os seguintes guardrails:

- endpoints HTTP chamam diretamente os use cases existentes
- validacao de transporte e serializacao ficam na camada web
- erros `GraphMemoError` sao mapeados para HTTP com o mesmo `error_code` e mensagem segura
- UI unica em HTML/CSS/JS consumindo somente a API local
- bootstrap de dependencias compartilhado entre CLI e Web para evitar divergencia de composicao

## Impacto

- Tecnico: mantem fonte de verdade no core/application e evita duplicacao de logica
- Operacional: reduz friccao para demos e onboarding sem substituir a CLI oficial
- Evolucao: permite migrar para frontend dedicado no futuro sem quebrar os use cases

## Relacoes

- [[Feature:Web UI minima local-first para operacao do Graph-Memo]]
- [[Decision:Stack inicial da CLI Graph-Memo]]
- [[ADR-001]]
- [[ADR-003]]
