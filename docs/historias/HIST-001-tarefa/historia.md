# HIST-001-tarefa — Tarefas

## Visão geral

Criar, listar, editar e remover tarefas da equipe. A lista é agrupada por status. A mudança de status fica em `HIST-002-tarefa`.

Dependências: `HIST-001-auth`, `HIST-001-equipe`.

## Origem

- Escopo: RN-07; seção 4 (papéis); RF-06, RF-07; tela 2.
- Modelo de Dados: `tarefa`.
- API e Decisões: `/tarefas`.

## Requisitos funcionais

1. Qualquer usuário com equipe cria tarefa.
   - Critério de aceitação: com `titulo` válido, a tarefa nasce com status `PENDENTE`, na equipe do criador, e `criado_por_id` igual ao criador; resposta `201`.
2. O responsável é definido pelo papel do criador.
   - Critério de aceitação: para `MEMBRO`, o responsável é sempre ele mesmo, mesmo que `responsavelId` seja enviado; para o `DONO`, `responsavelId` escolhe qualquer usuário da equipe e, se omitido, vale o próprio Dono.
3. Os campos respeitam limites.
   - Critério de aceitação: `titulo` obrigatório com 1 a 150 caracteres; `descricao` até 2000; `prazo` opcional no formato data (`AAAA-MM-DD` na API). Violação responde `400 VALIDACAO` com erro de campo; data em formato errado indica o campo `prazo` com `INVALIDO`. Na tela, o prazo é digitado e exibido em `DD/MM/AAAA`, com validação de data real antes do envio.
4. O responsável deve ser da mesma equipe.
   - Critério de aceitação: `responsavelId` de usuário de outra equipe ou inexistente responde `400 VALIDACAO`.
5. Qualquer usuário com equipe lista as tarefas.
   - Critério de aceitação: `GET /api/tarefas` devolve só as tarefas da própria equipe, com responsável (id e nome) e status.
6. A edição segue o papel.
   - Critério de aceitação: o Dono edita qualquer tarefa; o Membro só edita tarefa da qual é responsável, e nos demais casos recebe `403 SEM_PERMISSAO`. Edita `titulo`, `descricao` e `prazo`; só o Dono altera `responsavelId`.
7. Só o Dono remove tarefa.
   - Critério de aceitação: Membro recebe `403 SEM_PERMISSAO`; tarefa de outra equipe ou inexistente responde `404 TAREFA_NAO_ENCONTRADA`.
8. A tela Tarefas lista, cria, edita e remove conforme o papel.
   - Critério de aceitação: a lista mostra 3 grupos (Pendente, Em andamento, Concluída); o botão Remover só aparece para o Dono; o campo responsável só aparece para o Dono na criação e edição; há estado vazio quando não há tarefas.

## Requisitos não-funcionais

- RNF-02: nunca devolver ou alterar tarefa de outra equipe.

## Cenários Gherkin

Cenário: [C01] Membro cria tarefa para si
  Dado um usuário com papel `MEMBRO`
  Quando ele cria uma tarefa com título válido, mesmo informando outro `responsavelId`
  Então a tarefa é criada com status `PENDENTE`
  E o responsável é o próprio Membro

Cenário: [C02] Dono cria tarefa para um membro
  Dado o Dono e um Membro da mesma equipe
  Quando o Dono cria uma tarefa com `responsavelId` do Membro
  Então a tarefa é criada com o Membro como responsável

Cenário: [C03] Dono cria tarefa sem informar responsável
  Dado o Dono da equipe
  Quando ele cria uma tarefa sem `responsavelId`
  Então o Dono é o responsável

Cenário: [C04] Rejeitar responsável de outra equipe
  Dado um usuário de outra equipe
  Quando o Dono cria uma tarefa com o id desse usuário como responsável
  Então a resposta é `400 VALIDACAO`
  E nenhuma tarefa é criada

Cenário: [C05] Aceitar título com 150 caracteres e rejeitar 151
  Dado um título com exatamente 150 caracteres, e outro com 151
  Quando cada tarefa é criada
  Então a primeira é aceita
  E a segunda responde `400 VALIDACAO` com erro de campo `TAMANHO_EXCEDIDO`

Cenário: [C06] Rejeitar título vazio
  Dado um título vazio ou só com espaços
  Quando a tarefa é criada
  Então a resposta é `400 VALIDACAO`

Cenário: [C07] Listar só tarefas da própria equipe
  Dado tarefas em duas equipes diferentes
  Quando um usuário da primeira equipe chama `GET /api/tarefas`
  Então a resposta contém apenas as tarefas da sua equipe

Cenário: [C08] Membro edita só a tarefa que é responsável
  Dado uma tarefa de um Membro e outra de um colega
  Quando o Membro edita a sua e depois tenta editar a do colega
  Então a edição da sua tarefa é aceita
  E a do colega responde `403 SEM_PERMISSAO`

Cenário: [C09] Só o Dono altera o responsável
  Dado uma tarefa de um Membro
  Quando o Membro tenta alterar o `responsavelId`
  Então a resposta é `403 SEM_PERMISSAO`
  E o Dono consegue alterar para outro usuário da equipe

Cenário: [C10] Só o Dono remove tarefa
  Dado uma tarefa da equipe
  Quando um Membro tenta removê-la
  Então a resposta é `403 SEM_PERMISSAO`
  E o Dono consegue removê-la com `204`

Cenário: [C11] Tarefa de outra equipe não é acessível
  Dado uma tarefa de outra equipe
  Quando um usuário tenta editá-la ou removê-la
  Então a resposta é `404 TAREFA_NAO_ENCONTRADA`

Cenário: [C12] Tela Tarefas conforme o papel
  Dado a tela Tarefas aberta por um Membro, e depois pelo Dono
  Quando as telas são exibidas
  Então ambas mostram os três grupos de status
  E só o Dono vê o campo responsável na criação e o botão Remover

Cenário: [C13] Prazo em DD/MM/AAAA
  Dado o formulário de tarefa
  Quando a pessoa digita o prazo "30112026"
  Então o campo mostra "30/11/2026" e o envio usa "2026-11-30"
  E uma data inexistente, como 31/02/2026, não é enviada e mostra "Prazo inválido"
  E, se a API recusar o prazo, a tela mostra a mensagem do campo

## Contrato da API

| Rota | Corpo | Resposta | Erros |
|---|---|---|---|
| `GET /api/tarefas` | — | `200 [{ id, titulo, descricao, status, prazo, responsavel: { id, nome } }]` | 401, 403 SEM_EQUIPE |
| `POST /api/tarefas` | `{ titulo, descricao?, prazo?, responsavelId? }` | `201` tarefa | 400 VALIDACAO |
| `PUT /api/tarefas/{id}` | `{ titulo, descricao?, prazo?, responsavelId? }` | `200` tarefa | 400, 403 SEM_PERMISSAO, 404 TAREFA_NAO_ENCONTRADA |
| `DELETE /api/tarefas/{id}` | — | `204` | 403 SEM_PERMISSAO, 404 TAREFA_NAO_ENCONTRADA |

## Telas afetadas

Tarefas (nova).

## Pontos em aberto

Nenhum.
