# Feature: Ingestao de chats v1

- tipo: #type/feature
- status: #status/done
- owner: engenharia
- risco: #risk/medium

## Problema de negocio

A memoria persistente do projeto precisava sair de stubs e passar a receber conhecimento vindo de conversas reais, de forma auditavel e sem dependencia de LLM.

## Criterios de aceite

- Comando `import-chats` funcional para arquivo unico e diretorio
- Suporte inicial aos providers `generic`, `claude`, `cursor`, `chatgpt`
- Fallback seguro para parser generic
- Normalizacao consistente de metadados e mensagens
- Persistencia em `knowledge/imports/` com suporte a `--dry-run`
- Testes cobrindo leitura, normalizacao e escrita
- README com exemplos de uso

## Escopo tecnico

- Modulos afetados: `src/cli`, `src/application/use-cases`, `src/application/ports`, `src/core/chat-import`, `src/infrastructure/ingestion`, `src/infrastructure/knowledge`, `tests`
- Contratos impactados: portas de leitura de export (`ChatImportReaderPort`) e escrita de conhecimento (`KnowledgeWriterPort`)
- Persistencia: arquivos markdown em `knowledge/imports/`

## Progresso

- [x] Descoberta
- [x] Desenho
- [x] Implementacao
- [x] Validacao
- [x] Operacao

## Relacoes

- [[Decision:Formato inicial das notas de importacao de chats]]
- [[Feature:Query layer e relacoes basicas do indice local]]
- [[ADR-001]]
- [[ADR-003]]
