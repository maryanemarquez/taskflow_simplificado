package com.taskflow.auth;

/** {@code tipo} define o papel da conta: {@code DONO} cria a própria equipe; {@code MEMBRO} nasce sem equipe. */
public record CadastroRequest(String nome, String email, String senha, String tipo) {
}
