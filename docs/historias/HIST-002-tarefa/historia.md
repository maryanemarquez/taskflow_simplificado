# HIST-002-tarefa — Status da tarefa

## Visão geral

O responsável (ou o Dono) move a tarefa pelo fluxo `PENDENTE` ↔ `EM_ANDAMENTO` ↔ `CONCLUIDA`, um estágio por vez.

Dependências: `HIST-001-tarefa`.

## Origem

- Escopo: RN-06, RN-07; seção 4 (papéis); RF-08; tela 2.
- API e Decisões: `PATCH /tarefas/{id}/status`.

## Requisitos funcionais

1. O status muda um estágio por vez, avançando ou retrocedendo.
   - Critério de aceitação: de `PENDENTE` só vai a `EM_ANDAMENTO`; de `EM_ANDAMENTO` vai a `PENDENTE` ou `CONCLUIDA`; de `CONCLUIDA` só volta a `EM_ANDAMENTO`. Qualquer outra mudança responde `400 TRANSICAO_STATUS_INVALIDA`.
2. Quem pode alterar o status.
   - Critério de aceitação: o Dono altera qualquer tarefa da equipe; o Membro só as que é responsável, e nos demais casos recebe `403 SEM_PERMISSAO`.
3. Pedir o mesmo status atual não é uma transição.
   - Critério de aceitação: responde `400 TRANSICAO_STATUS_INVALIDA`.
4. O valor de status é validado.
   - Critério de aceitação: valor fora de `PENDENTE`, `EM_ANDAMENTO`, `CONCLUIDA` responde `400 VALIDACAO`.
5. A tela Tarefas permite avançar e retroceder.
   - Critério de aceitação: cada tarefa mostra os botões "Avançar" e "Voltar" apenas quando a ação é possível e permitida ao usuário; após a ação, a tarefa aparece no novo grupo.

## Requisitos não-funcionais

- RNF-02: tarefa de outra equipe responde `404 TAREFA_NAO_ENCONTRADA`.

## Cenários Gherkin

Cenário: [C01] Responsável avança a tarefa
  Dado uma tarefa `PENDENTE` sob responsabilidade de um Membro
  Quando o Membro avança o status duas vezes
  Então ela passa a `EM_ANDAMENTO` e depois a `CONCLUIDA`

Cenário: [C02] Responsável retrocede a tarefa
  Dado uma tarefa `CONCLUIDA` sob responsabilidade de um Membro
  Quando o Membro muda o status para `EM_ANDAMENTO`
  Então a tarefa fica `EM_ANDAMENTO`

Cenário: [C03] Pular estágio
  Dado uma tarefa `PENDENTE`
  Quando o responsável muda o status direto para `CONCLUIDA`
  Então a resposta é `400 TRANSICAO_STATUS_INVALIDA`
  E o status continua `PENDENTE`

Cenário: [C04] Repetir o status atual
  Dado uma tarefa `EM_ANDAMENTO`
  Quando o responsável envia `EM_ANDAMENTO`
  Então a resposta é `400 TRANSICAO_STATUS_INVALIDA`

Cenário: [C05] Membro não responsável
  Dado uma tarefa de outro Membro
  Quando um Membro tenta alterar o status
  Então a resposta é `403 SEM_PERMISSAO`

Cenário: [C06] Dono altera qualquer tarefa
  Dado uma tarefa sob responsabilidade de um Membro
  Quando o Dono avança o status
  Então a alteração é aceita

Cenário: [C07] Status inválido e tarefa de outra equipe
  Dado o valor de status "FEITO", e uma tarefa de outra equipe
  Quando cada requisição é enviada
  Então "FEITO" responde `400 VALIDACAO`
  E a tarefa de outra equipe responde `404 TAREFA_NAO_ENCONTRADA`

Cenário: [C08] Botões de status na tela
  Dado a tela Tarefas aberta por um Membro
  Quando ela exibe uma tarefa `PENDENTE` sua e uma tarefa de colega
  Então a sua mostra apenas "Avançar"
  E a do colega não mostra botões de status

## Contrato da API

| Rota | Corpo | Resposta | Erros |
|---|---|---|---|
| `PATCH /api/tarefas/{id}/status` | `{ status }` | `200` tarefa | 400 VALIDACAO, 400 TRANSICAO_STATUS_INVALIDA, 403 SEM_PERMISSAO, 404 TAREFA_NAO_ENCONTRADA |

## Telas afetadas

Tarefas (botões Avançar e Voltar).

## Pontos em aberto

Nenhum.
