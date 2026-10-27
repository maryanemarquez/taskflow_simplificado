package com.taskflow.erro;

/** Nomes dos campos da API citados nos erros de validação. */
public enum CampoApi {
    NOME("nome"),
    EMAIL("email"),
    SENHA("senha"),
    TIPO("tipo"),
    TITULO("titulo"),
    DESCRICAO("descricao"),
    RESPONSAVEL_ID("responsavelId"),
    STATUS("status");

    private final String nome;

    CampoApi(String nome) {
        this.nome = nome;
    }

    public String nome() {
        return nome;
    }
}
