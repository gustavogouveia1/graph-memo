# Processo Obrigatorio para Resolver Bugs

## 1) Registro

- `MUST` abrir registro em `knowledge/bugs/` com: impacto, severidade, ambiente, versao, evidencia.
- `MUST` incluir passos de reproducao deterministica.
- `MUST` definir dono e SLA conforme severidade.

## 2) Diagnostico

- `MUST` reproduzir bug antes de corrigir.
- `MUST` identificar causa raiz (nao apenas sintoma).
- `MUST` mapear alcance: modulos, dados, clientes afetados.

## 3) Correcao

- `MUST` implementar correcao minima segura.
- `MUST` adicionar teste de regressao.
- `MUST` avaliar necessidade de hotfix, feature flag ou rollback.

## 4) Validacao

- `MUST` validar em ambiente representativo.
- `MUST` confirmar que nao introduziu regressao lateral.
- `MUST` atualizar observabilidade se faltou sinal de deteccao.

## 5) Encerramento

- `MUST` registrar causa raiz final, decisao e acao preventiva.
- `MUST` vincular commit/PR, teste de regressao e notas de decisao.
- `SHOULD` atualizar anti-padrao caso bug revele fragilidade recorrente.

## Checklist de bugfix

- [ ] Reproducao confirmada
- [ ] Causa raiz identificada
- [ ] Correcao minima aplicada
- [ ] Teste de regressao adicionado
- [ ] Telemetria adequada verificada
- [ ] Registro do bug atualizado e vinculado
