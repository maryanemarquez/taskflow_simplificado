# HIST-001-fundacao — Base técnica

## Visão geral

Entrega a base técnica do TaskFlow reduzido: estrutura dos módulos, configuração por variáveis de ambiente, erro padrão da API, entidades JPA que geram o banco com 3 tabelas e CI único. Não tem funcionalidade de negócio.

Dependências: nenhuma.

## Origem

- API e Decisões, seções 1, 3, 4 e 5 (DT-01, DT-04, DT-05).
- Modelo de Dados, seções "Pacote e classes", "Esquema do banco" e "Integridade".

## Requisitos funcionais

1. As tabelas são geradas a partir das entidades JPA, sem scripts SQL.
   - Critério de aceitação: ao iniciar a aplicação em um banco vazio, existem as tabelas `usuario`, `equipe` e `tarefa` com as colunas, restrições e índices do Modelo de Dados; não existe Flyway nem arquivo `.sql` no backend; as tabelas `workspace`, `usuario_workspace` e `refresh_token` não são criadas.
2. A configuração vem de variáveis de ambiente.
   - Critério de aceitação: sem `DB_USER`, `DB_PASSWORD` ou `JWT_SECRET`, a aplicação não inicia; `.env.example` lista as variáveis sem valores.
3. Todo erro da API segue o formato padrão.
   - Critério de aceitação: erros respondem JSON `{ "codigo", "mensagem", "erros": [{ "campo", "codigo" }] }`; `erros` só aparece em `400 VALIDACAO`; exceção inesperada responde `500 ERRO_INTERNO` sem expor stack trace. Rota inexistente responde `404 ROTA_NAO_ENCONTRADA`, método não aceito `405 METODO_NAO_PERMITIDO` e corpo que não é JSON `415 TIPO_CONTEUDO_NAO_SUPORTADO`; valor de campo com formato errado no JSON (ex.: data) responde `400 VALIDACAO` apontando o campo.
4. A CI executa testes e cobertura.
   - Critério de aceitação: o workflow `ci.yml` roda `./mvnw verify` (testes e JaCoCo) no backend e `tsc --noEmit` e `jest` no frontend a cada PR; falha se a cobertura do backend for menor que 80%.

## Requisitos não-funcionais

- Datas gravadas em UTC (relógio injetável via `Clock`).

## Cenários Gherkin

Cenário: [C01] Entidades criam o esquema reduzido
  Dado um banco vazio
  Quando a aplicação é iniciada
  Então existem as tabelas `usuario`, `equipe` e `tarefa`
  E o e-mail de `usuario` é único
  E não existem `workspace`, `usuario_workspace` nem `refresh_token`

Cenário: [C02] Aplicação exige variável obrigatória
  Dado que `JWT_SECRET` não está definida
  Quando a aplicação é iniciada
  Então a inicialização falha indicando a variável ausente

Cenário: [C03] Erro inesperado não expõe detalhes
  Dado um endpoint que lança exceção inesperada
  Quando ele é chamado
  Então a resposta é `500 ERRO_INTERNO` no formato padrão
  E o corpo não contém stack trace

Cenário: [C04] Relógio injetável
  Dado um `Clock` fixo configurado
  Quando um componente consulta o instante atual
  Então ele obtém o instante do `Clock` injetado

Cenário: [C05] Relógio padrão em UTC
  Dado a configuração padrão de tempo
  Quando o `Clock` é criado
  Então ele usa o fuso UTC

Cenário: [C06] Rota inexistente
  Dado uma rota que não existe
  Quando ela é chamada
  Então a resposta é `404 ROTA_NAO_ENCONTRADA` no formato padrão

Cenário: [C07] Método não permitido
  Dado uma rota que não aceita o método usado
  Quando ela é chamada com esse método
  Então a resposta é `405 METODO_NAO_PERMITIDO`

Cenário: [C08] Corpo que não é JSON
  Dado uma rota que recebe JSON
  Quando ela recebe um corpo `text/plain`
  Então a resposta é `415 TIPO_CONTEUDO_NAO_SUPORTADO`

Cenário: [C09] Valor com formato inválido indica o campo
  Dado um JSON com `prazo` "2026/11/30"
  Quando ele é enviado
  Então a resposta é `400 VALIDACAO` com erro de campo `prazo` `INVALIDO`
  E um corpo que não é JSON válido responde `400 VALIDACAO` sem `erros`

## Contrato da API

Não se aplica (sem endpoints de negócio).

## Telas afetadas

Nenhuma.

## Pontos em aberto

Nenhum.
