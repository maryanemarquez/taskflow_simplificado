# HIST-001-equipe — Equipe e membros

## Visão geral

O Dono gerencia quem está na equipe: lista, adiciona por e-mail de conta existente e remove membros. Quem fica sem equipe vê apenas a tela "Sem equipe": o Membro que acabou de se cadastrar (tipo `MEMBRO`, sem equipe) e o removido de uma equipe. O Membro nunca cria equipe; entra numa equipe somente quando um Dono adiciona o seu e-mail.

Dependências: `HIST-001-auth`. A reatribuição na remoção (C06) usa a tabela `tarefa`, criada na fundação.

## Origem

- Escopo: RN-01, RN-03, RN-04, RN-05, RN-09; RF-03 a RF-05; telas 3 e 4; seção 4 (papéis).
- Modelo de Dados: `usuario`, `tarefa`, seção "Integridade".
- API e Decisões: `/membros`.

## Requisitos funcionais

1. Qualquer membro com equipe lista os membros da equipe.
   - Critério de aceitação: `GET /api/membros` devolve só usuários da própria equipe, com id, nome, e-mail e papel.
2. O Dono adiciona um membro pelo e-mail.
   - Critério de aceitação: com e-mail de conta existente e sem equipe, a conta passa a ter a equipe do Dono e papel `MEMBRO`; resposta `201` com o membro.
3. A adição valida o e-mail informado.
   - Critério de aceitação: e-mail sem conta responde `404 USUARIO_NAO_ENCONTRADO`; conta que já tem equipe (inclusive a própria) responde `409 USUARIO_JA_TEM_EQUIPE`.
4. Só o Dono adiciona e remove membros.
   - Critério de aceitação: chamada de Membro responde `403 SEM_PERMISSAO`.
5. O Dono remove um membro.
   - Critério de aceitação: na mesma transação, todas as tarefas sob responsabilidade do membro passam ao Dono, e o membro fica com `equipe_id` e `papel` nulos; a conta é mantida. Se qualquer etapa falhar, nada muda.
6. O Dono não pode ser removido.
   - Critério de aceitação: remover o Dono responde `400 DONO_NAO_PODE_SER_REMOVIDO`.
7. Rotas de equipe exigem estar em uma equipe.
   - Critério de aceitação: usuário sem equipe chamando `/membros` ou `/tarefas` responde `403 SEM_EQUIPE`.
8. Telas Membros e Sem equipe.
   - Critério de aceitação: Membros lista os membros; para o Dono mostra o campo de e-mail e o botão Remover (exceto no Dono); para Membro não mostra essas ações. Sem equipe mostra aviso e botão Sair, e não dá acesso às demais telas.

## Requisitos não-funcionais

- RNF-02: nunca devolver ou alterar usuário de outra equipe.

## Cenários Gherkin

Cenário: [C01] Listar membros da própria equipe
  Dado uma equipe com o Dono e dois Membros, e outra equipe com um usuário
  Quando um Membro chama `GET /api/membros`
  Então a resposta contém exatamente os três usuários da sua equipe

Cenário: [C02] Dono adiciona conta existente sem equipe
  Dado uma conta cadastrada que não tem equipe
  Quando o Dono adiciona o e-mail dessa conta
  Então a conta passa a pertencer à equipe com papel `MEMBRO`
  E a resposta é `201`

Cenário: [C03] Adicionar e-mail sem conta
  Dado um e-mail que não pertence a nenhuma conta
  Quando o Dono tenta adicioná-lo
  Então a resposta é `404 USUARIO_NAO_ENCONTRADO`

Cenário: [C04] Adicionar conta que já tem equipe
  Dado uma conta que já pertence a uma equipe
  Quando o Dono tenta adicioná-la
  Então a resposta é `409 USUARIO_JA_TEM_EQUIPE`
  E a conta continua na equipe original

Cenário: [C05] Membro não adiciona nem remove
  Dado um usuário com papel `MEMBRO`
  Quando ele tenta adicionar ou remover um membro
  Então a resposta é `403 SEM_PERMISSAO`

Cenário: [C06] Remover membro reatribui tarefas ao Dono
  Dado um Membro responsável por duas tarefas
  Quando o Dono remove esse Membro
  Então as duas tarefas passam a ter o Dono como responsável
  E o Membro fica sem equipe e sem papel, com a conta mantida

Cenário: [C07] Remoção falha e nada muda
  Dado que a reatribuição das tarefas falha durante a remoção
  Quando a remoção é processada
  Então o Membro continua na equipe e as tarefas mantêm o responsável

Cenário: [C08] Remover o Dono
  Dado a equipe com seu Dono
  Quando o Dono tenta remover a si mesmo
  Então a resposta é `400 DONO_NAO_PODE_SER_REMOVIDO`

Cenário: [C09] Usuário sem equipe é bloqueado
  Dado um usuário removido da equipe
  Quando ele chama `/api/membros`
  Então a resposta é `403 SEM_EQUIPE`
  E o frontend mostra somente a tela "Sem equipe" com o botão Sair

Cenário: [C10] Membro readicionado volta a operar
  Dado um usuário que foi removido
  Quando um Dono adiciona seu e-mail
  Então ele volta a acessar Tarefas e Membros como `MEMBRO`

Cenário: [C11] Membro recém-cadastrado é adicionado pelo Dono
  Dado uma pessoa que se cadastrou com tipo `MEMBRO` e está na tela "Sem equipe"
  Quando um Dono adiciona o e-mail dela
  Então ela passa a ter a equipe do Dono com papel `MEMBRO`
  E acessa Tarefas e Membros

Cenário: [C12] Membro sem equipe não cria tarefa nem equipe
  Dado uma pessoa cadastrada como `MEMBRO`, ainda sem equipe
  Quando ela tenta criar uma tarefa ou uma equipe
  Então a criação de tarefa responde `403 SEM_EQUIPE`
  E não existe rota para criar equipe, e nenhuma equipe é criada

## Contrato da API

| Rota | Corpo | Resposta | Erros |
|---|---|---|---|
| `GET /api/membros` | — | `200 [{ id, nome, email, papel }]` | 401, 403 SEM_EQUIPE |
| `POST /api/membros` | `{ email }` | `201 { id, nome, email, papel }` | 400 VALIDACAO, 403 SEM_PERMISSAO, 404 USUARIO_NAO_ENCONTRADO, 409 USUARIO_JA_TEM_EQUIPE |
| `DELETE /api/membros/{id}` | — | `204` | 400 DONO_NAO_PODE_SER_REMOVIDO, 403 SEM_PERMISSAO, 404 USUARIO_NAO_ENCONTRADO |

## Telas afetadas

Membros (nova), Sem equipe (nova; mostra o e-mail da conta para o Dono saber qual adicionar).

## Pontos em aberto

Nenhum.
