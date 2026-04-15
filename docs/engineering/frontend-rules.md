# Regras de Front-end

## Arquitetura de UI

- `MUST` separar componentes de apresentacao de logica de estado/efeitos.
- `MUST` manter estado minimo necessario e derivar o restante.
- `MUST` centralizar chamadas a API em camada de servico.
- `MUST` evitar acoplamento direto entre componente de UI e formato bruto de API.

## Qualidade de experiencia

- `MUST` tratar loading, vazio, erro e sucesso em toda tela de dados remotos.
- `MUST` garantir acessibilidade basica (navegacao teclado, labels, contraste).
- `MUST` evitar bloqueios longos na thread principal.
- `SHOULD` aplicar lazy loading para rotas e recursos pesados.

## Seguranca no cliente

- `MUST` escapar conteudo dinamico exibido.
- `MUST NOT` armazenar segredos no cliente.
- `MUST` respeitar controle de autorizacao vindo do back-end (UI nao substitui seguranca real).

## Performance de renderizacao

- `MUST` evitar re-renderizacoes desnecessarias em listas e componentes caros.
- `SHOULD` memoizar apenas quando houver ganho comprovado.
- `MUST` paginar ou virtualizar listas grandes.

## Criterios auditaveis

- Cada tela principal cobre 4 estados: loading, vazio, erro, sucesso.
- Componentes possuem responsabilidade unica e previsivel.
- Nenhum componente executa regra de negocio critica.
