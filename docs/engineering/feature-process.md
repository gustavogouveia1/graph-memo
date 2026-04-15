# Processo Obrigatorio para Implementar Features

## 1) Preparacao

- `MUST` registrar problema de negocio, objetivo, nao-objetivos e criterio de sucesso.
- `MUST` mapear impacto em arquitetura, seguranca, dados e observabilidade.
- `MUST` verificar ADRs existentes e notas no vault.

## 2) Desenho

- `MUST` definir contrato de entrada/saida e fluxo de erro.
- `MUST` decompor em incrementos entregaveis.
- `SHOULD` planejar rollout gradual para fluxo critico.

## 3) Implementacao

- `MUST` seguir regras de dominio (`backend`, `frontend`, `database`, `security`).
- `MUST` incluir testes proporcionais ao risco.
- `MUST` adicionar logs/metricas/traces para operacao.

## 4) Validacao

- `MUST` executar checklist de DoD.
- `MUST` validar cenarios funcionais e de falha.
- `MUST` documentar mudancas de comportamento no vault.

## 5) Pos-entrega

- `MUST` monitorar indicadores de sucesso definidos.
- `SHOULD` registrar aprendizado e ajuste de processo.

## Checklist de feature

- [ ] Escopo e criterio de sucesso definidos
- [ ] Impacto tecnico e riscos mapeados
- [ ] Contratos definidos e versionados quando necessario
- [ ] Testes e observabilidade atualizados
- [ ] Documentacao viva atualizada
