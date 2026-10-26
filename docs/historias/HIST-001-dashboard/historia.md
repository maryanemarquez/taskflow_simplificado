# HIST-001-dashboard — Dashboard da equipe

## Visão geral

Dono e Membro veem, ao entrar, quantas tarefas a equipe tem em cada status e quantas estão sob a sua responsabilidade ("Minhas tarefas"). A tela passa a ser o destino padrão após login, cadastro e abertura da raiz da aplicação.

Fora de escopo: gráficos, filtros, métricas avançadas e atualização automática por intervalo (a tela atualiza ao abrir, ao voltar o foco à janela e após alterações feitas na própria aplicação).

Dependências: `HIST-001-auth`, `HIST-001-equipe`, `HIST-001-tarefa`, `HIST-002-tarefa`.

## Origem

- Escopo: RF-09; seção 4 (papéis); tela 5; RN-09; RNF-02.
- API e Decisões: `GET /api/dashboard`.

## Requisitos funcionais

1. O Dashboard informa as contagens da equipe por status.
   - Critério de aceitação: `GET /api/dashboard` responde `200` com `equipe` contendo `PENDENTE`, `EM_ANDAMENTO` e `CONCLUIDA`, somando as tarefas da equipe do usuário.
2. O Dashboard informa as tarefas do usuário por status.
   - Critério de aceitação: a mesma resposta traz `minhasTarefas` com as três contagens das tarefas cujo responsável é o usuário autenticado; tarefas só criadas por ele não entram.
3. Status sem tarefas aparecem com zero.
   - Critério de aceitação: as seis contagens estão sempre presentes e valem `0` quando não há tarefas.
4. As contagens refletem o estado persistido.
   - Critério de aceitação: criação, exclusão, troca de responsável e mudança de status alteram as contagens da próxima consulta, sem cache no servidor.
5. Os dados são isolados por equipe.
   - Critério de aceitação: as contagens consideram só a equipe do usuário; usuário sem equipe recebe `403 SEM_EQUIPE`; sem token recebe `401 NAO_AUTENTICADO`.
6. A tela exibe as contagens.
   - Critério de aceitação: a tela mostra um cartão por status com a contagem da equipe e a seção "Minhas tarefas" com as três contagens do usuário, usando os mesmos rótulos de status da tela Tarefas.
7. A tela se mantém atual.
   - Critério de aceitação: a consulta é refeita ao abrir a tela, ao recuperar o foco da janela e depois de qualquer criação, edição, mudança de status ou exclusão de tarefa, e de qualquer adição ou remoção de membro, feita pela interface.
8. O Dashboard é o destino padrão.
   - Critério de aceitação: após login, cadastro ou abertura da raiz por usuário com equipe, a tela exibida é o Dashboard; usuário sem equipe continua vendo "Sem equipe". A navegação ganha o item "Dashboard".

## Requisitos não-funcionais

- RNF-02: contagens calculadas no backend (`GROUP BY status`), só com dados da equipe autenticada.

## Cenários Gherkin

Cenário: [C01] Contar as tarefas da equipe por status
  Dado tarefas em status diferentes na equipe
  Quando um usuário envia `GET /api/dashboard`
  Então `equipe` traz a contagem correta de cada status

Cenário: [C02] Contar só as tarefas do usuário
  Dado tarefas atribuídas ao usuário e a outro membro
  Quando o usuário envia `GET /api/dashboard`
  Então `minhasTarefas` conta só as tarefas atribuídas a ele
  E `equipe` conta todas

Cenário: [C03] Devolver zero nos status sem tarefas
  Dado uma equipe sem tarefas
  Quando um usuário envia `GET /api/dashboard`
  Então as seis contagens estão presentes e valem zero

Cenário: [C04] Isolar os dados por equipe
  Dado tarefas em duas equipes diferentes
  Quando o Dono de uma delas consulta o Dashboard
  Então as contagens consideram só a sua equipe

Cenário: [C05] Refletir a mudança de status
  Dado uma tarefa do usuário `PENDENTE`
  Quando o status dela muda para `EM_ANDAMENTO`
  Então a próxima consulta mostra uma tarefa a menos em `PENDENTE` e uma a mais em `EM_ANDAMENTO`

Cenário: [C06] Negar o Dashboard a usuário sem equipe
  Dado um usuário autenticado sem equipe
  Quando ele envia `GET /api/dashboard`
  Então a resposta é `403 SEM_EQUIPE`

Cenário: [C07] Exigir autenticação
  Dado uma requisição sem token
  Quando ela chega a `GET /api/dashboard`
  Então a resposta é `401 NAO_AUTENTICADO`

Cenário: [C08] Exibir os cartões e Minhas tarefas
  Dado uma equipe com tarefas e um usuário com tarefas atribuídas
  Quando o usuário abre o Dashboard
  Então a tela mostra um cartão por status com a contagem da equipe
  E a seção "Minhas tarefas" mostra as três contagens dele, com zero onde não há tarefas

## Contrato da API

| Rota | Corpo | Resposta | Erros |
|---|---|---|---|
| `GET /api/dashboard` | — | `200 { equipe: { PENDENTE, EM_ANDAMENTO, CONCLUIDA }, minhasTarefas: { PENDENTE, EM_ANDAMENTO, CONCLUIDA } }` | 401 NAO_AUTENTICADO, 403 SEM_EQUIPE |

## Telas afetadas

Dashboard (nova); navegação (item "Dashboard"); redirecionamento inicial.

## Pontos em aberto

Nenhum.
