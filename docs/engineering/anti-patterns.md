# Anti-padroes Proibidos

## Arquitetura e codigo

- Logica de negocio em controller/componente de UI.
- Dependencia ciclica entre modulos.
- Classe/servico "deus" com responsabilidades difusas.
- Copia/cola de regra de negocio entre contextos.
- Comentario para justificar codigo obscuro sem refatorar.

## Seguranca

- Segredo em codigo, commit ou log.
- Validacao apenas no cliente.
- Autorizacao baseada em flag enviada pelo front-end.
- Construcao de query SQL por concatenacao de string.

## Banco e performance

- Migracao destrutiva sem plano de rollback.
- Alteracao de schema sem avaliar impacto em dados existentes.
- Query sem indice em caminho critico conhecido.
- Operacao em lote sem controle de pagina/janela.

## Processo

- Corrigir bug sem reproducao e sem teste de regressao.
- Implementar feature sem criterio de aceite.
- Alterar contrato sem versionamento ou comunicacao.
- Concluir task sem atualizar documentacao viva.

## Qualquer ocorrencia acima bloqueia conclusao de task ate remediacao.
