# Regras de Arquitetura e Responsabilidades

## Principios arquiteturais

- `MUST` aplicar separacao clara entre apresentacao, aplicacao, dominio e infraestrutura.
- `MUST` evitar dependencia ciclica entre modulos.
- `MUST` manter regras de negocio no dominio, nunca em controllers, handlers ou componentes de UI.
- `MUST` definir fronteiras explicitas por contexto funcional.
- `SHOULD` preferir composicao em vez de heranca profunda.

## Separacao de responsabilidades

- Camada de entrada (`controller`, `route`, `resolver`) apenas valida entrada, chama caso de uso e traduz resposta.
- Camada de aplicacao (`use case`, `service`) orquestra fluxo e transacoes.
- Camada de dominio implementa regras centrais e invariantes.
- Camada de infraestrutura implementa acesso externo (DB, cache, fila, HTTP, storage).
- Repositorios nao podem conter regra de negocio.

## Contratos internos

- `MUST` existir interfaces/contratos para integracoes com infraestrutura.
- `MUST` mapear DTOs de entrada/saida; nao expor entidade de dominio diretamente para transporte.
- `MUST` versionar contratos quando houver quebra.
- `SHOULD` usar objetos imutaveis para comandos e eventos.

## Dependencias

- `MUST` depender de abstracoes ao atravessar camadas.
- `MUST NOT` permitir importacao direta de infraestrutura para dominio.
- `SHOULD` limitar bibliotecas globais; preferir adaptadores locais.

## Criterios auditaveis

- Nao existe importacao ciclica entre modulos.
- Cada endpoint chama um caso de uso explicito.
- Cada regra de negocio critica possui teste de unidade no dominio.
- Mudancas arquiteturais relevantes possuem ADR vinculada.
