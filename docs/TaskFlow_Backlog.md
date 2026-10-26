# TaskFlow — Backlog (7 histórias)

Cada história está em `docs/historias/<ID>/historia.md`. Os testes citam o cenário como `<ID>/Cxx`.

## Ordem de dependência

| Ordem | ID | Título | Depende de | Cenários | RF |
|---|---|---|---|---|---|
| 1 | `HIST-001-fundacao` | Base técnica | — | 9 | — |
| 2 | `HIST-001-auth` | Cadastro (Dono ou Membro), login e sessão | fundação | 17 | RF-01, RF-02 |
| 3 | `HIST-001-equipe` | Equipe e membros | auth | 12 | RF-03 a RF-05 |
| 4 | `HIST-001-tarefa` | Tarefas | auth, equipe | 13 | RF-06, RF-07 |
| 5 | `HIST-002-tarefa` | Status da tarefa | tarefa | 8 | RF-08 |
| 6 | `HIST-001-dashboard` | Dashboard da equipe | tarefa | 8 | RF-09 |
| 7 | `HIST-001-visual` | Novo visual, visões Lista e Kanban e seletor de prazo | dashboard | 16 | RF-10 |

Total: 83 cenários.

## Mapa de telas

| Tela | Histórias |
|---|---|
| Login / Cadastro | `HIST-001-auth`, `HIST-001-visual` |
| Tarefas | `HIST-001-tarefa`, `HIST-002-tarefa`, `HIST-001-visual` |
| Membros | `HIST-001-equipe`, `HIST-001-visual` |
| Sem equipe | `HIST-001-equipe`, `HIST-001-visual` |
| Dashboard | `HIST-001-dashboard`, `HIST-001-visual` |

## Mapa de endpoints

| Endpoint | História |
|---|---|
| `POST /auth/cadastro`, `POST /auth/login`, `GET /me` | `HIST-001-auth` |
| `GET/POST /membros`, `DELETE /membros/{id}` | `HIST-001-equipe` |
| `GET/POST /tarefas`, `PUT/DELETE /tarefas/{id}` | `HIST-001-tarefa` |
| `PATCH /tarefas/{id}/status` | `HIST-002-tarefa` |
| `GET /dashboard` | `HIST-001-dashboard` |

## Mapa de entidades

| Entidade | Criada em |
|---|---|
| `Usuario`, `Equipe`, `Tarefa` (esquema gerado pelo JPA) | `HIST-001-fundacao` |

## Situação atual do código

| História | Estado |
|---|---|
| `HIST-001-fundacao` | Entregue: entidades JPA, ambiente, erro padrão (inclui 404, 405 e 415), `Clock` e CI único |
| `HIST-001-auth` | Entregue: cadastro por tipo de conta (Dono cria equipe; Membro nasce sem equipe), login, `/me`, validação do JWT e telas |
| `HIST-001-equipe` | Entregue: listar, adicionar por e-mail (inclui o Membro recém-cadastrado), remover com reatribuição e tela "Sem equipe" |
| `HIST-001-tarefa`, `HIST-002-tarefa` | Entregues: CRUD, grupos por status, mudança de status e prazo em DD/MM/AAAA |
| `HIST-001-dashboard` | Entregue: `GET /api/dashboard`, tela Dashboard, item na navegação e destino padrão após login |
| `HIST-001-visual` | Entregue: menu lateral, telas de acesso, Dashboard, Tarefas (Lista e Kanban com arrastar e soltar), Membros e Sem equipe; só frontend |

> A execução dos testes do backend (`./mvnw verify`) depende do ambiente do desenvolvedor; confirme a cobertura mínima de 80% antes do merge.
