# TaskFlow — API e Decisões Técnicas

## 1. Convenções da API

- Base: `/api`. JSON. Autenticação: `Authorization: Bearer <JWT>`.
- Erro padrão: `{ "codigo": "EMAIL_JA_CADASTRADO", "mensagem": "...", "erros": [{ "campo": "senha", "codigo": "SENHA_FORA_DA_POLITICA" }] }`. O campo `erros` só existe em `400 VALIDACAO`.
- Códigos HTTP: 200/201/204 sucesso, 400 validação, 401 não autenticado, 403 sem permissão, 404 não encontrado, 405 método não permitido, 409 conflito, 415 tipo de conteúdo não suportado, 500 erro interno.
- Datas na API: `AAAA-MM-DD`. A interface digita e exibe `DD/MM/AAAA` e converte.

## 2. Endpoints (12)

| Método | Rota | Quem | Descrição |
|---|---|---|---|
| POST | `/auth/cadastro` | Público | Body `{ nome, email, senha, tipo }`, com `tipo` obrigatório: `DONO` cria usuário + equipe; `MEMBRO` cria só o usuário, sem equipe. Retorna token |
| POST | `/auth/login` | Público | Retorna token |
| GET | `/me` | Autenticado | Usuário, papel e equipe |
| GET | `/membros` | Com equipe | Lista membros |
| POST | `/membros` | Dono | Body `{ email }`. Adiciona conta existente sem equipe |
| DELETE | `/membros/{id}` | Dono | Remove e reatribui tarefas ao Dono |
| GET | `/tarefas` | Com equipe | Lista tarefas da equipe |
| POST | `/tarefas` | Com equipe | `{ titulo, descricao, prazo, responsavelId? }` |
| PUT | `/tarefas/{id}` | Dono ou responsável | Edita campos (responsável só o Dono) |
| PATCH | `/tarefas/{id}/status` | Dono ou responsável | `{ status }` adjacente ao atual |
| DELETE | `/tarefas/{id}` | Dono | Remove |
| GET | `/dashboard` | Com equipe | `{ equipe, minhasTarefas }`, cada um com `PENDENTE`, `EM_ANDAMENTO` e `CONCLUIDA` (zero quando vazio) |

## 3. Códigos de erro

| Código | HTTP |
|---|---|
| `VALIDACAO` | 400 |
| `TRANSICAO_STATUS_INVALIDA` | 400 |
| `DONO_NAO_PODE_SER_REMOVIDO` | 400 |
| `NAO_AUTENTICADO` | 401 |
| `CREDENCIAIS_INVALIDAS` | 401 |
| `SEM_PERMISSAO` | 403 |
| `SEM_EQUIPE` | 403 |
| `USUARIO_NAO_ENCONTRADO` | 404 |
| `TAREFA_NAO_ENCONTRADA` | 404 |
| `ROTA_NAO_ENCONTRADA` | 404 |
| `METODO_NAO_PERMITIDO` | 405 |
| `TIPO_CONTEUDO_NAO_SUPORTADO` | 415 |
| `EMAIL_JA_CADASTRADO` | 409 |
| `USUARIO_JA_TEM_EQUIPE` | 409 |
| `ERRO_INTERNO` | 500 |

Códigos de campo em `erros[]`: `OBRIGATORIO`, `INVALIDO` (formato errado: e-mail, tipo de conta, data), `TAMANHO_EXCEDIDO`, `SENHA_FORA_DA_POLITICA`. Quando o corpo JSON tem um valor de formato errado (ex.: data), `erros[]` aponta o campo.

## 4. Decisões técnicas (5)

| ID | Decisão |
|---|---|
| DT-01 | **Backend:** Java 21, Spring Boot, Spring Data JPA, MySQL 8. As tabelas são geradas pelas entidades `@Entity` (`ddl-auto`), sem Flyway e sem scripts SQL. |
| DT-02 | **Frontend:** Expo (React Native Web), Expo Router, TanStack Query, axios. Sem Zustand: o token fica no armazenamento local (`localStorage`) em módulo simples. |
| DT-03 | **Sessão:** só JWT de acesso (HS256, validade 8 h), validado por interceptor, sem Spring Security. Sem refresh token. Senha com BCrypt. |
| DT-04 | **Configuração:** segredos por variáveis de ambiente; `.env.example` sem valores reais. |
| DT-05 | **Testes:** JUnit com H2 (modo MySQL) no backend, Jest no frontend; cobertura mínima de 80% no backend (JaCoCo). |

## 5. Organização do código

```
backend/src/main/java/com/taskflow/
  dominio/   entidades JPA, enums e repositórios
  auth/      cadastro, login, JWT, interceptor
  equipe/    membros
  tarefa/    tarefas e status
  dashboard/ contagens por status
  erro/      tratador de erros
frontend/
  app/       rotas (login, cadastro, dashboard, tarefas, membros, sem-equipe)
  src/       api, telas, componentes
```

## 6. Limitações conhecidas

- `ddl-auto=update` não remove nem renomeia colunas e tabelas; mudanças desse tipo exigem recriar o banco. Aceito neste projeto reduzido.
- Testes em H2 podem divergir do MySQL em detalhes de tipo e ordenação; validar em MySQL real antes de entregar.

## 7. Removido em relação à V1

E-mail (SMTP), recuperação de senha, convite por token, refresh token, Zustand, Flyway, Testcontainers, Checkstyle, PMD, ArchUnit, gates de qualidade, DT-06 a DT-15 originais.
