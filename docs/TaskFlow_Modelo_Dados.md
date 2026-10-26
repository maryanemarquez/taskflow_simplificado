# TaskFlow — Modelo de Dados (3 entidades)

Banco: MySQL 8 em dev/prod e H2 (modo MySQL) nos testes. Persistência com Spring Data JPA/Hibernate: **as tabelas são geradas a partir das entidades** (`spring.jpa.hibernate.ddl-auto`), sem scripts SQL. Datas em UTC (`Instant`).

## Diagrama

```
Equipe 1 ──── N Usuario
Equipe 1 ──── N Tarefa
Usuario 1 ──── N Tarefa (responsável)
Usuario 1 ──── N Tarefa (criador)
```

## Pacote e classes

Pacote `com.taskflow.dominio`:

| Classe | Tipo | Tabela |
|---|---|---|
| `Usuario` | `@Entity` | `usuario` |
| `Equipe` | `@Entity` | `equipe` |
| `Tarefa` | `@Entity` | `tarefa` |
| `Papel` | `enum` (`DONO`, `MEMBRO`) | — |
| `StatusTarefa` | `enum` (`PENDENTE`, `EM_ANDAMENTO`, `CONCLUIDA`) | — |

Repositórios (`JpaRepository`): `UsuarioRepository`, `EquipeRepository`, `TarefaRepository`.

## Usuario

| Campo | Mapeamento | Regra |
|---|---|---|
| `id` | `@Id @GeneratedValue(IDENTITY) Long` | |
| `nome` | `@Column(length = 100, nullable = false)` | |
| `email` | `@Column(length = 150, nullable = false, unique = true)` | Imutável; gravado em minúsculas |
| `senhaHash` | `@Column(name = "senha_hash", length = 255, nullable = false)` | BCrypt |
| `equipe` | `@ManyToOne(fetch = LAZY) @JoinColumn(name = "equipe_id")` | Nulo = sem equipe (Membro recém-cadastrado ou removido). O tipo de conta escolhido no cadastro não é coluna: Dono nasce com equipe e papel `DONO`; Membro nasce sem equipe |
| `papel` | `@Enumerated(STRING) @Column(length = 10)` | Nulo quando sem equipe |
| `criadoEm` | `@Column(name = "criado_em", nullable = false) Instant` | |

## Equipe

| Campo | Mapeamento | Regra |
|---|---|---|
| `id` | `@Id @GeneratedValue(IDENTITY) Long` | |
| `nome` | `@Column(length = 150, nullable = false)` | |
| `criadoEm` | `@Column(name = "criado_em", nullable = false) Instant` | |

## Tarefa

| Campo | Mapeamento | Regra |
|---|---|---|
| `id` | `@Id @GeneratedValue(IDENTITY) Long` | |
| `equipe` | `@ManyToOne(fetch = LAZY, optional = false) @JoinColumn(name = "equipe_id")` | |
| `titulo` | `@Column(length = 150, nullable = false)` | |
| `descricao` | `@Column(length = 2000)` | Opcional |
| `responsavel` | `@ManyToOne(fetch = LAZY, optional = false) @JoinColumn(name = "responsavel_id")` | Mesma equipe da tarefa |
| `criadoPor` | `@ManyToOne(fetch = LAZY, optional = false) @JoinColumn(name = "criado_por_id")` | |
| `status` | `@Enumerated(STRING) @Column(length = 15, nullable = false)` | Padrão `PENDENTE` |
| `prazo` | `LocalDate` | Opcional |
| `criadoEm` | `@Column(name = "criado_em", nullable = false) Instant` | |

Índices (`@Table(indexes = ...)`): `tarefa(equipe_id, status)`, `tarefa(responsavel_id)`, `usuario(equipe_id)`.

## Integridade

- Um Dono por equipe (garantido pela aplicação).
- Responsável deve pertencer à mesma equipe da tarefa (validado no serviço).
- Remover membro: na mesma transação (`@Transactional`), as tarefas dele passam ao Dono e `equipe` e `papel` do usuário ficam nulos.
- Sem exclusão física de usuário ou equipe.

## Esquema do banco

- Dev e prod: `ddl-auto=update`. Cria as tabelas na primeira execução e ajusta colunas novas. Não remove tabelas ou colunas antigas.
- Teste: `ddl-auto=create-drop` em H2.
- Ao adotar este modelo sobre um banco antigo, apagar e recriar o banco (`DROP DATABASE` / `CREATE DATABASE`).

## Removido em relação à V1

`usuario_workspace`, `convite`, `projeto`, `tag`, `tarefa_tag`, `recuperacao_senha`, `refresh_token`; scripts SQL e Flyway.
