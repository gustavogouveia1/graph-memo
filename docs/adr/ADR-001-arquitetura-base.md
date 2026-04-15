# ADR-001: Arquitetura Base em Camadas com Fronteiras Claras

- **Status:** Accepted
- **Data:** 2026-04-15
- **Autores:** Engenharia
- **Relacionados:** `docs/engineering/architecture-rules.md`

## Contexto

O projeto necessita evolucao sustentavel, com baixa entropia arquitetural e facil onboarding para contribuidores humanos e IA.

## Decisao

Adotar arquitetura em camadas:

- apresentacao
- aplicacao (casos de uso)
- dominio
- infraestrutura

Com dependencia orientada para dentro e contratos explicitos entre fronteiras.

## Consequencias

### Positivas

- Menor acoplamento e maior testabilidade.
- Mudancas locais com menor risco de regressao sistêmica.

### Negativas / Trade-offs

- Overhead inicial de estrutura e mapeamento.
- Necessidade de disciplina para evitar atalhos em features urgentes.

## Alternativas consideradas

- Arquitetura anemica sem fronteiras: descartada por alto risco de acoplamento.
- MVC sem separacao de dominio: descartada para evitar regra de negocio dispersa.

## Plano de adocao

- Aplicar em novas implementacoes imediatamente.
- Migrar codigo legado gradualmente por modulo.
- Bloquear novas violacoes em review tecnico.
