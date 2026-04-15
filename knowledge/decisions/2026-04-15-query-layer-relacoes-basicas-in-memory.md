# Decision: Camada de consulta separada com relacoes basicas in-memory

- tipo: #type/decision
- status: #status/done
- owner: engenharia
- data: 2026-04-15

## Problema

Adicionar consultas sobre o indice local sem acoplar casos de uso a IO e sem introduzir banco de grafo prematuramente.

## Opcoes

- Opcao A: consultar direto em `FileIndexStore`, sem camada dedicada
- Opcao B: criar query layer em memoria com reader de indice dedicado e contrato explicito

## Decisao tomada

Adotar a opcao B:

- `FileIndexQueryReader` para leitura validada de `.graphmemo/`
- `LocalIndexQueryLayer` pura (sem IO), baseada em relacoes explicitas
- `QueryIndexUseCase` para orquestracao e retorno da task `query`

## Impacto

- Tecnico: separa persistencia e consulta com responsabilidades claras
- Operacional: falhas de indice ausente/corrompido passam a ter erro tipado com acao de recuperacao
- Evolucao: prepara extensao para relacoes mais ricas sem mudar o contrato de CLI de uma vez

## Relacoes

- [[Feature:Query layer e relacoes basicas do indice local]]
- [[Feature:Indexador local v1 do codebase]]
- [[ADR-001]]
- [[ADR-003]]
