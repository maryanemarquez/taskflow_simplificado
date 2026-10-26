# HIST-001-visual — Novo visual, visões Lista e Kanban

## Visão geral

Modernização visual do frontend (menu lateral, topo com usuário, telas refinadas) e nova visão Kanban na tela Tarefas, com arrastar e soltar. Não há mudança de API, de banco nem de regras de negócio.

Dependências: `HIST-001-dashboard`.

## Origem

- Escopo: RF-10; seção 8 (telas 1 a 5); RN-06 e seção 4 (papéis) continuam valendo.
- Decisão humana: Kanban removido da lista "Fora do escopo".
- Continuam fora do escopo: projetos, tags, busca, filtros, prioridade, recuperação de senha, edição de perfil, convite e data de entrada de membros (a API não a devolve).

## Requisitos funcionais

1. Menu lateral com Dashboard, Tarefas e Membros (ícone e nome), item ativo destacado e bloco da equipe no rodapé.
   - Critério de aceitação: a navegação mostra os três itens com esses nomes; no celular o menu abre e fecha por um botão.
2. Topo com avatar, nome e papel do usuário e ação Sair.
3. Telas Login e Cadastro com o novo visual, mantendo a escolha obrigatória Dono ou Membro no cadastro.
4. Dashboard com um cartão por status (ícone, cor e contagem) para a equipe e para "Minhas tarefas".
5. Tarefas com visões Lista e Kanban alternáveis. A Lista mostra um bloco por status, com uma tarefa por linha (título e descrição em uma linha, responsável, prazo e ações), uma abaixo da outra; a última visão escolhida é lembrada no navegador.
6. Criar e editar tarefa em janela modal (título, descrição, prazo em DD/MM/AAAA e responsável para o Dono).
7. No Kanban, arrastar o cartão para a coluna vizinha muda o status.
   - Critério de aceitação: só quem pode alterar a tarefa (Dono, ou Membro responsável) arrasta; soltar numa coluna não vizinha não altera nada e mostra a mensagem "Mova a tarefa um estágio por vez.".
8. Os botões Voltar e Avançar continuam disponíveis nos cartões, nas duas visões.
9. Prazo escolhido num calendário que abre ao tocar no campo "Prazo" (popover).
   - Critério de aceitação: o prazo começa vazio e é opcional; no topo do calendário há três caixas `__ / __ / ____` (dia, mês e ano) com as barras fixas e avanço automático do foco; clicar num dia, ou Enter com a data completa, confirma e fecha; Esc ou clique fora também fecham; um "×" no campo remove o prazo.
   - Datas passadas não podem ser escolhidas: dias anteriores a hoje ficam desabilitados, e digitar uma data passada mostra "Não é possível escolher uma data passada.". Um prazo já vencido de uma tarefa existente pode ser mantido ao editar.
   - Não há atalhos ("Hoje", "Amanhã" etc.).

## Requisitos não-funcionais

- Layout responsivo (celular, tablet e desktop).
- Sem mudança nos endpoints existentes.

## Cenários Gherkin

Cenário: [C01] Menu lateral
  Dado um usuário com equipe
  Quando abre qualquer tela autenticada
  Então vê os itens "Dashboard", "Tarefas" e "Membros" e o botão "Sair"

Cenário: [C02] Papel no topo
  Dado o Dono "Dono" autenticado
  Quando abre o Dashboard
  Então o topo mostra o nome "Dono" e o papel "Dono"

Cenário: [C03] Lista e alternância de visão
  Dado a tela Tarefas na visão Lista
  Então cada status é um bloco, na ordem Pendente, Em andamento e Concluída, com uma tarefa por linha
  Quando o usuário escolhe "Kanban"
  Então vê uma coluna por status com as tarefas correspondentes

Cenário: [C04] Visão lembrada
  Dado que o usuário escolheu "Kanban"
  Quando volta à tela Tarefas
  Então a visão Kanban continua selecionada

Cenário: [C05] Estado vazio
  Dado uma equipe sem tarefas
  Quando o usuário abre a tela Tarefas
  Então vê a mensagem de estado vazio e o botão "Nova tarefa"

Cenário: [C06] Criar tarefa pela janela modal
  Dado a tela Tarefas
  Quando o usuário abre "Nova tarefa", preenche o título e salva
  Então a tarefa é criada e a janela fecha

Cenário: [C07] Arrastar para a coluna vizinha
  Dado uma tarefa `PENDENTE` que o usuário pode alterar
  Quando ela é solta na coluna "Em andamento"
  Então o status muda para `EM_ANDAMENTO`

Cenário: [C08] Arrastar para coluna não vizinha
  Dado uma tarefa `PENDENTE`
  Quando ela é solta na coluna "Concluída"
  Então nada é enviado à API
  E aparece "Mova a tarefa um estágio por vez."

Cenário: [C09] Arrastar sem permissão
  Dado uma tarefa de outro Membro
  Quando um Membro tenta arrastá-la
  Então o cartão não é arrastável e nada é enviado à API

Cenário: [C10] Dashboard com cartões por status
  Dado contagens de tarefas da equipe e do usuário
  Quando abre o Dashboard
  Então cada cartão mostra o nome do status e a contagem

Cenário: [C11] Membros em tabela
  Dado uma equipe com 2 pessoas
  Quando o usuário abre Membros
  Então vê "2 pessoas na equipe" e a lista com nome, e-mail e papel
  E só o Dono vê o bloco "Adicionar à equipe" e a ação "Remover"

Cenário: [C12] Prazo opcional e calendário
  Dado o formulário de nova tarefa
  Então o prazo está vazio ("Selecionar data")
  Quando o usuário toca em "Prazo"
  Então vê as caixas dia, mês e ano e o calendário do mês atual

Cenário: [C13] Escolher um dia
  Dado o calendário aberto
  Quando o usuário clica em um dia futuro
  Então o prazo mostra a data em DD/MM/AAAA e o calendário fecha

Cenário: [C14] Datas passadas
  Dado o calendário aberto no mês atual
  Então os dias anteriores a hoje estão desabilitados e o mês anterior não pode ser aberto
  Quando o usuário digita uma data passada
  Então vê "Não é possível escolher uma data passada." e o prazo não muda

Cenário: [C15] Remover o prazo
  Dado uma tarefa com prazo
  Quando o usuário toca no "×" do campo
  Então o prazo volta a "Selecionar data" e a tarefa é salva com `prazo: null`

Cenário: [C16] Prazo já vencido em tarefa existente
  Dado uma tarefa cujo prazo já passou
  Quando o usuário edita e salva sem mudar o prazo
  Então o prazo antigo é mantido
