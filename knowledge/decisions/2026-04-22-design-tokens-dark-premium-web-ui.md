# Decision: Design tokens dark premium para Web UI local-first

- tipo: #type/decision
- status: #status/done
- owner: engenharia
- data: 2026-04-22

## Problema

A Web UI minima estava funcional, porem sem sistema visual consistente para transmitir maturidade de produto e sem hierarquia suficiente entre navegacao, formularios, acoes e saidas.

## Decisao tomada

Aplicar redesign visual sem alterar logica de negocio, com os seguintes guardrails:

- manter a camada web como transporte fino sobre os mesmos use cases
- concentrar o redesign em tokens reutilizaveis (`surface`, `border`, `text`, `accent`, `radius`, `shadow`, `focus`)
- padronizar estilos de tabs, inputs, checkboxes, botoes e resultados por classes de UI
- reforcar estados de interacao (hover, focus-visible, active, disabled e loading)
- incluir navegacao por teclado em tabs e manter semantica de `tablist`/`tabpanel`

## Impacto

- Tecnico: melhora manutencao visual com sistema coeso em um unico ponto (`render-web-ui`) e sem duplicacao de logica.
- Produto: aumenta percepcao de confianca e qualidade da interface para uso em contexto profissional.
- Operacional: preserva local-first e contratos HTTP atuais sem necessidade de migracao.

## Relacoes

- [[Feature:Premium redesign da Web UI local-first]]
- [[Decision:Camada HTTP fina e UI minima sobre use cases]]
- [[ADR-001]]
