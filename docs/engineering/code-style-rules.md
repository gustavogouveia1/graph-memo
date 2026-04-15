# Regras de Clean Code e Nomenclatura

## Regras gerais de codigo

- `MUST` escrever codigo legivel sem depender de comentario para explicar obvio.
- `MUST` manter funcoes pequenas e com responsabilidade unica.
- `MUST` eliminar duplicacao sem criar abstracao prematura.
- `MUST` remover codigo morto, flags obsoletas e TODO sem dono.
- `SHOULD` evitar efeitos colaterais ocultos.

## Convencoes de nomenclatura

- Nomes devem refletir intencao de negocio, nao detalhe tecnico.
- `MUST` usar verbos para acoes (`createInvoice`, `validateToken`).
- `MUST` usar substantivos para entidades (`Invoice`, `UserPolicy`).
- `MUST` evitar abreviacoes ambiguas (`tmp`, `obj`, `data2`).
- `MUST` padronizar sufixos por papel: `Repository`, `Service`, `UseCase`, `Mapper`, `Dto`.

## Estrutura de funcao/metodo

- `MUST` validar pre-condicoes no inicio.
- `MUST` retornar erros de dominio tipados, nao strings soltas.
- `SHOULD` manter no maximo 3 niveis de identacao.
- `SHOULD` extrair blocos complexos em metodos nomeados.

## Comentarios

- `MUST` comentar apenas intencao, restricao ou trade-off.
- `MUST NOT` comentar o obvio.
- `MUST` registrar racional tecnico em ADR para decisoes de impacto.

## Criterios auditaveis

- Linters e formatadores sem erros.
- Nenhum identificador generico sem contexto de negocio.
- Complexidade ciclomatica dentro do limite definido pelo time.
- Arquivos novos seguem padrao de nomeacao e estrutura do modulo.
