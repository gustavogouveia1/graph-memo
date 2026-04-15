# Regras de Seguranca

## Principios obrigatorios

- `MUST` adotar padrao deny-by-default para autorizacao.
- `MUST` validar e sanitizar toda entrada externa.
- `MUST` proteger segredos fora do codigo-fonte.
- `MUST` aplicar principio de menor privilegio em acessos internos e externos.
- `MUST` tratar seguranca como requisito de entrega, nao atividade posterior.

## Autenticacao e autorizacao

- `MUST` validar identidade em toda rota protegida.
- `MUST` checar permissao por recurso e acao.
- `MUST` expirar tokens/sessoes conforme politica definida.
- `MUST` registrar tentativa de acesso negado com contexto minimo.
- `MUST NOT` confiar em dados de permissao vindos do cliente.

## Segredos e credenciais

- `MUST` usar gerenciador de segredos ou variaveis seguras por ambiente.
- `MUST` rotacionar credenciais comprometidas imediatamente.
- `MUST NOT` commitar chaves, tokens, dumps sensiveis ou `.env`.
- `SHOULD` separar credenciais por ambiente e por servico.

## Protecoes de aplicacao

- `MUST` usar queries parametrizadas para acesso a banco.
- `MUST` proteger contra injection, XSS, CSRF e SSRF conforme superficie exposta.
- `MUST` aplicar rate limiting em endpoints sensiveis.
- `MUST` mascarar dados sensiveis em logs.
- `SHOULD` aplicar cabecalhos de seguranca no front-end web.

## Vulnerabilidades e dependencia

- `MUST` monitorar CVEs de dependencias criticas.
- `MUST` corrigir vulnerabilidade critica antes de release.
- `SHOULD` manter dependencia minima e atualizada.

## Criterios auditaveis

- Checklist de seguranca preenchido na entrega.
- Nenhum segredo em repositorio.
- Testes de autorizacao cobrindo cenarios de negacao.
- Logs sem vazamento de dados sensiveis.
