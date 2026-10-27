package com.taskflow.configuracao;

/** Prefixos e rotas da API em um só lugar. */
public final class Rotas {

    public static final String PREFIXO_API = "/api";
    public static final String PREFIXO_AUTH = PREFIXO_API + "/auth";
    public static final String ROTA_CADASTRO = "/cadastro";
    public static final String ROTA_LOGIN = "/login";
    public static final String ROTA_ME = PREFIXO_API + "/me";
    public static final String TAREFAS = PREFIXO_API + "/tarefas";
    public static final String MEMBROS = PREFIXO_API + "/membros";
    public static final String DASHBOARD = PREFIXO_API + "/dashboard";

    private Rotas() {
    }
}
