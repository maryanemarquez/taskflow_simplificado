# HIST-001-auth — Cadastro, login e sessão

## Visão geral

A pessoa cria conta, entra e sai do sistema. No cadastro escolhe o tipo de conta. **Dono**: cria, em uma única operação, o usuário e a equipe "Equipe de {nome}", com papel `DONO`. **Membro**: cria só o usuário, sem equipe e sem papel; a conta fica na tela "Sem equipe" até um Dono adicioná-la pelo e-mail (`HIST-001-equipe`), e não cria equipe por conta própria. Nos dois casos a sessão é iniciada. A API passa a validar o JWT em todas as rotas protegidas.

Dependências: `HIST-001-fundacao`.

## Origem

- Escopo: RN-01, RN-02, RN-08, RN-09 (RN-02 com os dois tipos de conta); RF-01, RF-02; RNF-01, RNF-02; tela 1.
- Modelo de Dados: `usuario`, `equipe`.
- API e Decisões: `/auth/cadastro`, `/auth/login`, `/me`; DT-03.

## Requisitos funcionais

1. O cadastro de tipo `DONO` cria usuário, equipe "Equipe de {nome}" e papel `DONO` na mesma transação.
   - Critério de aceitação: com dados válidos, os registros existem; se qualquer criação falhar, nada é persistido.
   - O cadastro de tipo `MEMBRO` cria só o usuário, com `equipe_id` e `papel` nulos, e nenhuma equipe.
2. O cadastro e o login devolvem um token de acesso.
   - Critério de aceitação: a resposta traz `tipo` "Bearer", `accessToken` (JWT HS256 com `sub` = id do usuário, validade 8 h) e `accessTokenExpiraEm`. Não há refresh token.
3. A senha segue a política: mínimo 8 caracteres, máximo 72 bytes em UTF-8, ao menos 1 letra e 1 número.
   - Critério de aceitação: senha fora da política responde `400 VALIDACAO` com erro de campo, sem criar registros.
4. Nome tem 1 a 100 caracteres e e-mail até 150, com formato válido. O e-mail é normalizado (sem espaços nas pontas, minúsculas) e é único.
   - Critério de aceitação: acima do limite responde `400 VALIDACAO` (`TAMANHO_EXCEDIDO`); formato inválido responde `400 VALIDACAO` (`INVALIDO`); e-mail repetido responde `409 EMAIL_JA_CADASTRADO`.
5. A senha é gravada só como hash BCrypt.
   - Critério de aceitação: nenhum registro nem resposta contém a senha em texto puro.
6. O login autentica por e-mail e senha.
   - Critério de aceitação: credenciais válidas respondem `200` com token; e-mail inexistente ou senha errada respondem `401 CREDENCIAIS_INVALIDAS`, com a mesma mensagem nos dois casos.
7. `GET /api/me` devolve o usuário autenticado.
   - Critério de aceitação: a resposta traz `usuario` (id, nome, e-mail) e `equipe` (id, nome, papel), com `equipe` nula quando o usuário não tem equipe.
8. Toda rota, exceto cadastro e login, exige JWT válido.
   - Critério de aceitação: sem token, com token inválido ou expirado, a API responde `401 NAO_AUTENTICADO`.
9. O logout encerra a sessão no frontend.
   - Critério de aceitação: ao acionar "Sair", o token é removido do armazenamento local e a pessoa volta ao login.
10. O frontend tem a tela Login/Cadastro e redireciona conforme o estado da sessão.
    - Critério de aceitação: sem sessão, qualquer rota abre o login; com sessão e equipe, abre Tarefas; com sessão sem equipe, abre Sem equipe.
11. O tipo de conta é obrigatório no cadastro.
    - Critério de aceitação: o corpo traz `tipo` com `DONO` ou `MEMBRO`; ausente responde `400 VALIDACAO` com `tipo`/`OBRIGATORIO`; outro valor responde `400 VALIDACAO` com `tipo`/`INVALIDO`; nenhum registro é criado. A tela de cadastro exige escolher entre Dono e Membro, explica cada um e não envia sem escolha.

## Requisitos não-funcionais

- RNF-01 e RNF-02: hash BCrypt; senha nunca retornada.

## Cenários Gherkin

Cenário: [C01] Cadastro de Dono cria usuário e equipe
  Dado que o e-mail ainda não está cadastrado
  Quando a pessoa envia nome, e-mail, senha válidos e tipo `DONO`
  Então são criados o usuário e a equipe "Equipe de {nome}"
  E o usuário tem papel `DONO`
  E a resposta é `201` com o token de acesso

Cenário: [C02] Cadastro normaliza o e-mail
  Dado o e-mail "  Ana@Mail.com " informado no cadastro
  Quando o cadastro é enviado
  Então o e-mail é gravado como "ana@mail.com"

Cenário: [C03] Aceitar senha com exatamente 72 bytes
  Dado uma senha válida que ocupa exatamente 72 bytes em UTF-8
  Quando o cadastro é enviado
  Então a senha é aceita sem truncamento

Cenário: [C04] Rejeitar senha com 73 bytes
  Dado uma senha que ocupa 73 bytes em UTF-8
  Quando o cadastro é enviado
  Então a resposta é `400 VALIDACAO` com erro de campo `TAMANHO_EXCEDIDO`
  E nenhum registro é criado

Cenário: [C05] Rejeitar senha sem número ou com menos de 8 caracteres
  Dado uma senha sem número, ou com 7 caracteres
  Quando o cadastro é enviado
  Então a resposta é `400 VALIDACAO` com erro de campo `SENHA_FORA_DA_POLITICA`
  E nenhum registro é criado

Cenário: [C06] Rejeitar nome ou e-mail acima do limite
  Dado um nome com 101 caracteres, ou um e-mail com 151
  Quando o cadastro é enviado
  Então a resposta é `400 VALIDACAO` com erro de campo `TAMANHO_EXCEDIDO`

Cenário: [C07] Rejeitar e-mail já cadastrado
  Dado que o e-mail já está cadastrado
  Quando o cadastro é enviado
  Então a resposta é `409 EMAIL_JA_CADASTRADO`
  E nenhum registro novo é criado

Cenário: [C08] Desfazer tudo quando a criação falha
  Dado que a criação da equipe falha durante o cadastro
  Quando o cadastro é processado
  Então nenhum usuário nem equipe é persistido

Cenário: [C09] Login válido
  Dado um usuário cadastrado
  Quando ele envia e-mail e senha corretos
  Então a resposta é `200` com o token de acesso

Cenário: [C10] Login inválido
  Dado um usuário cadastrado
  Quando ele envia a senha errada, ou um e-mail inexistente
  Então a resposta é `401 CREDENCIAIS_INVALIDAS` com a mesma mensagem nos dois casos

Cenário: [C11] Consultar a própria sessão
  Dado um usuário autenticado com equipe
  Quando ele chama `GET /api/me`
  Então a resposta traz seus dados, a equipe e o papel
  E não contém a senha nem o hash

Cenário: [C12] Rota protegida sem token válido
  Dado uma requisição sem token, com token adulterado, ou com token expirado
  Quando ela chama `GET /api/me`
  Então a resposta é `401 NAO_AUTENTICADO`

Cenário: [C13] Logout e redirecionamentos no frontend
  Dado uma pessoa com sessão ativa
  Quando ela aciona "Sair"
  Então o token é removido e o login é exibido
  E, sem sessão, abrir Tarefas redireciona ao login

Cenário: [C14] Cadastro de Membro cria só o usuário
  Dado que o e-mail ainda não está cadastrado
  Quando a pessoa envia nome, e-mail, senha válidos e tipo `MEMBRO`
  Então é criado apenas o usuário, sem equipe e sem papel
  E a resposta é `201` com o token de acesso
  E `GET /api/me` traz `equipe` nula

Cenário: [C15] Tipo de conta ausente
  Dado um cadastro sem o campo `tipo`
  Quando ele é enviado
  Então a resposta é `400 VALIDACAO` com erro de campo `tipo` `OBRIGATORIO`
  E nenhum registro é criado
  E a tela de cadastro não envia o formulário sem a escolha do tipo

Cenário: [C16] Tipo de conta desconhecido
  Dado um cadastro com `tipo` "ADMIN"
  Quando ele é enviado
  Então a resposta é `400 VALIDACAO` com erro de campo `tipo` `INVALIDO`
  E nenhum registro é criado

Cenário: [C17] E-mail com formato inválido
  Dado um cadastro com e-mail sem arroba ou sem domínio
  Quando ele é enviado
  Então a resposta é `400 VALIDACAO` com erro de campo `email` `INVALIDO`
  E nenhum registro é criado

## Contrato da API

| Rota | Corpo | Resposta | Erros |
|---|---|---|---|
| `POST /api/auth/cadastro` | `{ nome, email, senha, tipo }` (`tipo`: `DONO` ou `MEMBRO`) | `201 { tipo, accessToken, accessTokenExpiraEm }` (aqui `tipo` é o tipo do token, "Bearer") | 400 VALIDACAO, 409 EMAIL_JA_CADASTRADO |
| `POST /api/auth/login` | `{ email, senha }` | `200 { tipo, accessToken, accessTokenExpiraEm }` | 401 CREDENCIAIS_INVALIDAS |
| `GET /api/me` | — | `200 { usuario: { id, nome, email }, equipe: { id, nome, papel } \| null }` | 401 NAO_AUTENTICADO |

## Telas afetadas

Login/Cadastro (nova), Sem equipe (redirecionamento), menu com "Sair".

## Pontos em aberto

Nenhum.
