# TaskFlow — Escopo (versão reduzida)

## 1. Visão

Aplicação web simples de gestão de tarefas para equipes. Fluxo único:
cadastro → equipe criada → dono adiciona membros → tarefas criadas e acompanhadas até a conclusão.

## 2. Fora do escopo

Projetos, tags, busca, filtros, gráficos e métricas avançadas, prioridade, comentários, anexos, notificações, e-mail, convite por token, recuperação de senha, refresh token, edição de perfil, múltiplas equipes.

## 3. Entidades

| Entidade | Campos |
|---|---|
| Usuário | nome, e-mail (único, imutável), senha, equipe, papel |
| Equipe | nome |
| Tarefa | título, descrição, responsável, status, prazo |

## 4. Papéis

| Ação | Dono | Membro |
|---|---|---|
| Ver membros e tarefas da equipe | Sim | Sim |
| Adicionar / remover membros | Sim | Não |
| Criar tarefa | Sim (escolhe o responsável) | Sim (responsável = ele mesmo) |
| Editar tarefa | Qualquer | Só as suas (responsável) |
| Alterar status | Qualquer | Só as suas |
| Remover tarefa | Sim | Não |

## 5. Regras de negócio

| # | Regra |
|---|---|
| RN-01 | Usuário pertence a no máximo 1 equipe. |
| RN-02 | O cadastro exige escolher o tipo de conta. **Dono**: cria usuário + equipe "Equipe de {nome}" + papel DONO. **Membro**: cria só o usuário, sem equipe e sem papel; conta de Membro nunca cria equipe. Nos dois casos inicia a sessão. |
| RN-03 | Dono adiciona membro pelo e-mail. A conta deve existir e estar sem equipe (conta de Membro recém-cadastrada ou removida de uma equipe). |
| RN-04 | Dono não pode ser removido. |
| RN-05 | Ao remover membro, suas tarefas passam automaticamente ao Dono. A conta é mantida, sem equipe. |
| RN-06 | Status: `PENDENTE` → `EM_ANDAMENTO` → `CONCLUIDA`, um estágio por vez, avançando ou retrocedendo. |
| RN-07 | Tarefa nasce `PENDENTE`. Toda tarefa tem responsável. |
| RN-08 | Senha: mínimo 8 caracteres, máximo 72 bytes, ao menos 1 letra e 1 número. |
| RN-09 | Usuário sem equipe (inclui o Membro recém-cadastrado, que aguarda ser adicionado) só vê a tela "Sem equipe" e o botão Sair. |

## 6. Requisitos funcionais (10)

| ID | Requisito |
|---|---|
| RF-01 | Cadastrar conta (nome, e-mail, senha e tipo de conta: Dono ou Membro). |
| RF-02 | Autenticar por e-mail e senha; encerrar sessão. |
| RF-03 | Listar membros da equipe. |
| RF-04 | Adicionar membro por e-mail (Dono). |
| RF-05 | Remover membro com reatribuição automática (Dono). |
| RF-06 | Criar, editar e remover tarefa conforme papel. |
| RF-07 | Listar tarefas agrupadas por status. |
| RF-08 | Alterar status da tarefa conforme papel. |
| RF-09 | Exibir o Dashboard: contagem das tarefas da equipe por status e das tarefas do próprio usuário por status. |
| RF-10 | Alternar a tela Tarefas entre as visões Lista e Kanban; no Kanban, mover a tarefa entre colunas arrastando e soltando. |

## 7. Requisitos não funcionais (3)

| ID | Requisito |
|---|---|
| RNF-01 | Senhas com hash BCrypt; nunca retornadas pela API. |
| RNF-02 | Todo endpoint (exceto cadastro/login) exige JWT e isola dados por equipe. |
| RNF-03 | Cobertura de testes mínima de 80% no backend. |

## 8. Telas (5)

| # | Tela | Conteúdo |
|---|---|---|
| 1 | Login / Cadastro | Formulários alternáveis. O cadastro exige escolher Dono ou Membro, com a explicação de cada um. |
| 2 | Tarefas | Duas visões alternáveis: **Lista** (agrupada por status) e **Kanban** (uma coluna por status). Criar, editar, mudar status, remover. No Kanban o status também muda arrastando o cartão para a coluna vizinha (RN-06 continua valendo). O prazo é opcional e escolhido num calendário que abre ao tocar no campo; no topo do calendário digita-se `__ / __ / ____` (dia, mês e ano). Datas passadas não podem ser escolhidas. O prazo é exibido em DD/MM/AAAA. |
| 3 | Membros | Lista; campo de e-mail para adicionar; remover (Dono). |
| 4 | Sem equipe | Aviso e botão Sair. |
| 5 | Dashboard | Um cartão por status com a contagem da equipe e a seção "Minhas tarefas". Destino padrão após login e cadastro. |

Todas as telas autenticadas têm menu lateral (Dashboard, Tarefas, Membros) e a ação **Sair**.
