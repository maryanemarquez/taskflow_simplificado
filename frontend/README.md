# TaskFlow — frontend

App em Expo Router (React Native + web) com TypeScript, TanStack Query e axios. Fala com a API Java/Spring do TaskFlow.

## Como rodar

Requisitos: Node 22 e a API no ar (por padrão em `http://localhost:8080`).

```bash
npm ci
cp .env.example .env     # ajuste EXPO_PUBLIC_API_URL se a API estiver em outro endereço
npm run web              # abre no navegador
```

| Script | O que faz |
|---|---|
| `npm start` | Servidor do Expo (QR code para o celular) |
| `npm run web` | Servidor do Expo no navegador |
| `npm test` | Testes (jest-expo) |
| `npm run test:coverage` | Testes com cobertura |
| `npm run typecheck` | `tsc` em `src`, `app` **e** `__tests__` (`tsconfig.test.json`) |
| `npm run lint` | ESLint, sem nenhum aviso permitido |
| `npm run build:web` | Gera o site estático em `dist/` |

Antes de abrir um pedido de mudança, rode `typecheck`, `lint` e `test`.

### Sobre o `.npmrc`

O `.npmrc` tem `legacy-peer-deps=true`. O `expo-router` declara como peer opcional o `@testing-library/react-native` na versão 14 ou maior, e o projeto usa a 13.3.3. Sem essa opção, o `npm ci` falha com `ERESOLVE`. Quando migrarmos o Testing Library para a 14, o `.npmrc` pode sair.

## Estrutura

```
app/                  Rotas do Expo Router (só ligam a rota à tela)
  (app)/              Grupo protegido: _layout.tsx aplica Protected uma vez
src/
  core/               Código sem regra de negócio, usado por todas as features
    api/              httpClient, contrato com o backend, política de erros, invalidação
    config/           variáveis de ambiente
    log/              logger (único ponto autorizado a usar console)
    messages/         todos os textos da interface
    session/          token, expiração e aviso de sessão expirada
    storage/          acesso seguro ao localStorage
    theme/            tokens de cor, fonte, espaço e layout
    ui/               componentes genéricos (FormField, Modal, Badge...)
  features/           Uma pasta por assunto; cada uma com api/, model/ e ui/
    auth/ dashboard/ equipe/ membros/ shell/ tarefas/
__tests__/            Testes
```

Regra de dependência: `core` não importa de `features`. As demais features dependem de `auth` (usuário e papel) e não devem formar ciclos entre si.

## Convenções

- **Nomes em português e inglês.** Termos do domínio e do contrato com a API ficam em português (`titulo`, `prazo`, `responsavelId`, pastas `tarefas`, `membros`, `equipe`), porque são os nomes do backend. O resto do código fica em inglês (`useTasks`, `TaskCard`, `invalidateTaskData`). Textos para a pessoa ficam em português, sempre em `core/messages/messages.ts`.
- **Estilo sem números soltos.** Cores, fontes, espaços e tamanhos vêm de `theme`. Medida de uso único vira constante nomeada no topo do arquivo.
- **Sem `console`.** Use `logger` (`core/log/logger.ts`), que só aceita id, método, caminho, status e código. Nunca corpo da requisição, token nem e-mail.

## Contrato de erros com o backend

O backend responde erros em `application/problem+json`:

```json
{ "codigo": "VALIDACAO", "mensagem": "…", "erros": [{ "campo": "titulo", "codigo": "OBRIGATORIO", "mensagem": "…" }] }
```

- `codigo` é um dos 16 códigos de `core/api/apiContract.ts`. Código desconhecido vira `DESCONHECIDO`.
- `erros[].campo` + `erros[].codigo` viram mensagem junto do campo (`MESSAGES.fieldErrors`, chave `campo.CODIGO`).
- Toda requisição envia `X-Request-Id`; o backend o devolve em todas as respostas, inclusive nas de erro. O id entra nos logs.
- Só `NAO_AUTENTICADO` encerra a sessão. `CREDENCIAIS_INVALIDAS` (também 401) é erro de login.
- Falha de rede e tempo esgotado são `NetworkRequestError`, com texto próprio.
- Limites de tamanho dos campos ficam em `FIELD_LIMITS` (`apiContract.ts`) e devem acompanhar o backend: nome 100, e-mail 150, título 150, descrição 2000 (caracteres) e senha 72 (bytes).

## Sessão

- O login devolve `accessToken` e `accessTokenExpiraEm` (JWT de 8 h, sem refresh).
- **Web:** o token e a data de vencimento ficam no `localStorage`. Ao abrir o app, um token já vencido é descartado. Com a sessão aberta, o logout é agendado para o vencimento. Nos dois casos a tela de login mostra "Sua sessão expirou".
- **App nativo:** não há `localStorage`, então o token fica só em memória e a pessoa entra de novo ao reabrir o app. Persistir o token com `expo-secure-store` é a evolução natural.
- A conferência do vencimento usa o relógio do aparelho. Se ele estiver muito errado, a API ainda responde `NAO_AUTENTICADO` e a política de erros encerra a sessão.

## Arrastar e soltar

O Kanban permite arrastar cartões entre colunas **apenas na web** (eventos HTML5 de arrastar). No celular, use os botões "Voltar" e "Avançar" do cartão, que existem em todas as visões.

## Testes

- `jest-expo` com `@testing-library/react-native`; `jest.setup.ts` simula `localStorage` e os ícones.
- Tempo limite de 15 s por teste (`jest.config.js`), para máquinas lentas.
- Os testes usam `gcTime: Infinity` no QueryClient (`__tests__/testUtils.tsx`). Sem isso, os temporizadores de limpeza do TanStack Query seguram o processo do jest por 5 minutos depois do fim.
