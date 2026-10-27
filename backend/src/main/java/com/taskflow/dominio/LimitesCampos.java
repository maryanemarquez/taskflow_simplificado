package com.taskflow.dominio;

/** Tamanhos máximos dos textos, usados na validação e nas colunas das entidades. */
public final class LimitesCampos {

    public static final int NOME_USUARIO = 100;
    public static final int EMAIL = 150;
    public static final int NOME_EQUIPE = 150;
    public static final int TITULO_TAREFA = 150;
    public static final int DESCRICAO_TAREFA = 2000;

    private LimitesCampos() {
    }
}
