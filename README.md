# TaskFlow

Gestão simples de tarefas em equipe: cadastro → equipe criada → o Dono adiciona membros pelo e-mail → tarefas → status (Pendente ↔ Em andamento ↔ Concluída).

| Pasta | Conteúdo |
|---|---|
| `backend/` | Java 21, Spring Boot, JPA/Hibernate, MySQL. O esquema nasce das entidades `@Entity`. |
| `frontend/` | Expo / React Native Web. |
| `docs/` | Escopo, modelo de dados, API e decisões, backlog e histórias. |

Regras do projeto: `AGENTS.md`.

## Backend

```bash
cd backend
cp .env.example .env   # preencha os valores e exporte as variáveis
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
./mvnw verify          # testes + cobertura mínima de 80%
```

## Frontend

```bash
cd frontend
npm ci --legacy-peer-deps
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run web
npx tsc --noEmit && npx jest
```
