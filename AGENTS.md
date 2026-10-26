# TaskFlow — Regras do projeto

## Projeto

- Nome: TaskFlow. Idioma dos artefatos: português do Brasil.
- Backend: Java 21, Spring Boot, Spring Data JPA, MySQL (`backend/`). O esquema do banco nasce das entidades `@Entity`; não há scripts SQL nem Flyway.
- Frontend: Node 22, Expo / React Native Web (`frontend/`).
- Cobertura mínima de testes no backend: 80%.

## Documentos

| Documento | Caminho |
|---|---|
| Escopo | `docs/TaskFlow_Escopo.md` |
| Modelo de dados | `docs/TaskFlow_Modelo_Dados.md` |
| API e decisões | `docs/TaskFlow_API_e_Decisoes.md` |
| Backlog | `docs/TaskFlow_Backlog.md` |
| Histórias | `docs/historias/<ID>/historia.md` |

## Fluxo de trabalho

1. Escolher a próxima história do Backlog.
2. Escrever os testes dos cenários (cada teste cita `HIST-XXX-<dominio>/Cxx`).
3. Implementar até os testes passarem.
4. Abrir PR; o CI executa testes e cobertura.
5. Revisão humana e merge.

Branches: `feature/HIST-XXX-<dominio>`. Commits: `tipo: HIST-XXX-<dominio> - descrição curta`.

## Regras

1. Não inventar requisito. Dúvida vira pergunta ao humano.
2. Nunca escrever segredos em arquivos; usar variáveis de ambiente e `.env.example`.
3. Escopo fora de `TaskFlow_Escopo.md` seção 2 não é implementado.
4. Não commitar `target/`, `dist/`, `node_modules/` nem `.idea/`.
5. Em conflito entre código e documentos, valem os documentos.
6. Mudança no modelo de dados começa pela entidade JPA e pelo `TaskFlow_Modelo_Dados.md`.
