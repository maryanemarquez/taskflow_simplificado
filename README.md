# TaskFlow

Gestão simples de tarefas em equipe.

Fluxo: cadastro → equipe criada → o Dono adiciona membros pelo e-mail → tarefas → status (Pendente ↔ Em andamento ↔ Concluída).

## Funcionalidades

- **Contas:** cadastro como **Dono** (cria a própria equipe) ou **Membro** (nasce sem equipe e aguarda ser adicionado), login e sessão por JWT.
- **Equipe:** o Dono lista, adiciona (pelo e-mail) e remove membros. Ao remover, as tarefas do membro passam ao Dono.
- **Tarefas:** criar, editar, remover e atribuir responsável, com prazo opcional.
- **Status:** a tarefa só muda para o estágio vizinho (Pendente ↔ Em andamento ↔ Concluída).
- **Dashboard:** contagem de tarefas por status, da equipe e do usuário.
- **Visões:** Lista e Kanban (arrastar e soltar).

| Papel | Pode |
|---|---|
| Dono | Tudo da equipe: membros, tarefas, responsáveis e remoções |
| Membro | Criar tarefas para si e editar ou mudar o status das tarefas pelas quais é responsável |

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Backend | Java 21, Spring Boot 4, Spring Data JPA / Hibernate, MySQL 8, BCrypt, JWT (HS256, 8 h) |
| Frontend | Expo / React Native Web, TypeScript, Expo Router, TanStack Query, axios |
| Testes | JUnit 5, MockMvc e H2 (backend); Jest e Testing Library (frontend) |
| Qualidade | JaCoCo (cobertura mínima de 80% no backend) e GitHub Actions |

## Pré-requisitos

| Ferramenta | Versão |
|---|---|
| JDK | 21 |
| Node.js | 22 (`>=22 <23`) |
| MySQL | 8 |
| Git | Qualquer versão recente |

## Estrutura do repositório

```
taskflow/
├── backend/     API REST (Spring Boot)
├── frontend/    Aplicação web (Expo / React Native Web)
├── docs/        Escopo, modelo de dados, API, backlog e histórias
├── .github/     Workflow de CI e template de pull request
├── AGENTS.md    Regras de trabalho do projeto
└── LICENSE
```

Pacotes do backend (`backend/src/main/java/com/taskflow/`):

| Pacote | Responsabilidade |
|---|---|
| `dominio` | Entidades JPA (`Usuario`, `Equipe`, `Tarefa`), enums e repositórios |
| `auth` | Cadastro, login, JWT e interceptor de autenticação |
| `equipe` | Membros da equipe e regras de acesso |
| `tarefa` | Tarefas e mudança de status |
| `dashboard` | Contagens por status |
| `erro` | Tratamento global de erros, mensagens e logs |
| `tempo` | `Clock` em UTC |

Documentação:

| Documento | Caminho |
|---|---|
| Escopo | [`docs/TaskFlow_Escopo.md`](docs/TaskFlow_Escopo.md) |
| Modelo de dados | [`docs/TaskFlow_Modelo_Dados.md`](docs/TaskFlow_Modelo_Dados.md) |
| API e decisões técnicas | [`docs/TaskFlow_API_e_Decisoes.md`](docs/TaskFlow_API_e_Decisoes.md) |
| Backlog | [`docs/TaskFlow_Backlog.md`](docs/TaskFlow_Backlog.md) |
| Histórias | `docs/historias/<ID>/historia.md` |

## Configuração

### 1. Banco de dados

O Hibernate cria as tabelas a partir das entidades, mas **não cria o banco**. Crie-o antes da primeira execução:

```sql
CREATE DATABASE taskflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Variáveis de ambiente do backend

O Spring Boot **não lê o arquivo `.env` automaticamente**. O `backend/.env.example` é apenas o modelo das variáveis; defina-as na sessão do PowerShell antes de iniciar a API.

| Variável | Obrigatória | Padrão (perfil `dev`) | Descrição |
|---|---|---|---|
| `DB_HOST` | Em `prod` | `localhost` | Host do MySQL |
| `DB_PORT` | Em `prod` | `3306` | Porta do MySQL |
| `DB_NAME` | Em `prod` | `taskflow` | Nome do banco |
| `DB_USER` | Sim | — | Usuário do MySQL |
| `DB_PASSWORD` | Sim | — | Senha do MySQL |
| `JWT_SECRET` | Sim | — | Segredo de assinatura do JWT (use ao menos 32 caracteres) |
| `CORS_ORIGEM` | Não | `http://localhost:8081` | Origem do frontend liberada no CORS |

Gerar um `JWT_SECRET` aleatório:

```powershell
$bytes = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Definir as variáveis (válidas apenas na janela atual do PowerShell):

```powershell
$env:DB_USER     = "seu_usuario"
$env:DB_PASSWORD = "sua_senha"
$env:JWT_SECRET  = "cole_o_segredo_gerado"
```

> Nunca grave segredos em arquivos versionados. O `.gitignore` já ignora `.env` e `.env.*` (exceto `.env.example`).

### 3. Variável do frontend

O frontend lê `EXPO_PUBLIC_API_URL`, que aponta para a API. O Expo carrega o arquivo `frontend/.env` automaticamente:

```powershell
cd frontend
Copy-Item .env.example .env
```

Conteúdo padrão: `EXPO_PUBLIC_API_URL=http://localhost:8080`.

## Como executar

### Backend (porta 8080)

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

O perfil `dev` é o padrão. Para usar outro perfil: `.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=prod"`.

### Frontend (porta 8081)

```powershell
cd frontend
npm ci --legacy-peer-deps
npm run web
```

Acesse `http://localhost:8081`.

## Testes

| Camada | Comando | Observação |
|---|---|---|
| Backend | `.\mvnw.cmd verify` | Roda os testes em H2 (modo MySQL) e **falha se a cobertura de linhas for menor que 80%** |
| Frontend | `npx tsc --noEmit` e `npx jest` | Verificação de tipos e testes de tela |
| Frontend (cobertura) | `npm run test:coverage` | Relatório do Jest |

Os testes do backend não dependem do MySQL nem das variáveis de ambiente: o perfil `test` usa H2 e valores próprios. O relatório de cobertura fica em `backend\target\site\jacoco\index.html`.

Cada teste cita o cenário da história que cobre (ex.: `HIST-001-auth/C08`).

## API

Base: `/api`. JSON. Autenticação por `Authorization: Bearer <token>`. Erros seguem o formato `{ codigo, mensagem, erros[] }`.

| Método | Rota | Acesso |
|---|---|---|
| POST | `/api/auth/cadastro` | Público |
| POST | `/api/auth/login` | Público |
| GET | `/api/me` | Autenticado |
| GET | `/api/membros` | Com equipe |
| POST | `/api/membros` | Dono |
| DELETE | `/api/membros/{id}` | Dono |
| GET | `/api/tarefas` | Com equipe |
| POST | `/api/tarefas` | Com equipe |
| PUT | `/api/tarefas/{id}` | Dono ou responsável |
| PATCH | `/api/tarefas/{id}/status` | Dono ou responsável |
| DELETE | `/api/tarefas/{id}` | Dono |
| GET | `/api/dashboard` | Com equipe |

Detalhes e códigos de erro: [`docs/TaskFlow_API_e_Decisoes.md`](docs/TaskFlow_API_e_Decisoes.md).

## Integração contínua

O workflow `.github/workflows/ci.yml` roda em pull requests e em pushes para a `main`:

- **Backend:** `./mvnw -B verify` (testes e cobertura mínima de 80%).
- **Frontend:** `npm ci`, `tsc --noEmit` e `jest`.

## Contribuindo

As regras completas estão no [`AGENTS.md`](AGENTS.md). Resumo:

1. Escolha a próxima história do backlog.
2. Escreva os testes dos cenários, citando `HIST-XXX-<dominio>/Cxx`.
3. Implemente até os testes passarem.
4. Abra um pull request e aguarde o CI e a revisão.

Branches: `feature/HIST-XXX-<dominio>`. Commits: `tipo: HIST-XXX-<dominio> - descrição curta`.

## Limitações conhecidas

- `ddl-auto=update` cria tabelas e colunas novas, mas não remove nem renomeia as existentes. Esse tipo de mudança exige recriar o banco.
- Os testes usam H2, que pode divergir do MySQL em tipos e ordenação. Valide em MySQL real antes de entregar.
- Não há refresh token: o acesso expira em 8 horas e exige novo login.

## Licença

Distribuído sob a licença MIT. Consulte o arquivo [`LICENSE`](LICENSE).
