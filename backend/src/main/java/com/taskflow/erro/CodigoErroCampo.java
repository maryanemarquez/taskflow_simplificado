package com.taskflow.erro;

/** Motivo da falha de um campo; o código enviado à API é o próprio {@code name()}. */
public enum CodigoErroCampo {
    OBRIGATORIO("O campo é obrigatório."),
    INVALIDO("O valor informado é inválido."),
    TAMANHO_EXCEDIDO("O valor excede o tamanho máximo permitido."),
    SENHA_FORA_DA_POLITICA("A senha deve ter no mínimo 8 caracteres, com ao menos uma letra e um número.");

    private final String mensagem;

    CodigoErroCampo(String mensagem) {
        this.mensagem = mensagem;
    }

    public String mensagem() {
        return mensagem;
    }
}
