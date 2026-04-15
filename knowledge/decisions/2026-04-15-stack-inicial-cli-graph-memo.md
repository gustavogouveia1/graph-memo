# Decision: Stack inicial da CLI Graph-Memo

- tipo: #type/decision
- status: #status/done
- owner: engenharia
- data: 2026-04-15

## Problema

Definir uma base tecnica minima e profissional para iniciar o produto sem acoplamento prematuro e sem excesso de arquitetura.

## Opcoes

- Opcao A: JavaScript puro com scripts manuais, menor setup inicial e menor seguranca de tipos
- Opcao B: Node.js + TypeScript + CLI modular, maior robustez e melhor evolucao para novos pipelines

## Decisao tomada

Adotar Node.js + TypeScript com CLI modular (`commander`) e separacao em camadas (`cli`, `application`, `core`, `infrastructure`, `shared`), mantendo apenas abstrações necessarias para evolucao das proximas tasks.

## Impacto

- Tecnico: baseline testavel, tipada e com fronteiras claras
- Operacional: scripts de qualidade padronizados desde o inicio
- Seguranca: dependencia minima e configuracao local explicita

## Relacoes

- [[Feature:Bootstrap tecnico executavel da CLI]]
- [[Flow:Bootstrap CLI]]
- [[ADR-001]]
