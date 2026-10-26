package com.taskflow.erro;

/** Erro de validação de um campo: vira {@code 400 VALIDACAO} com {@code erros[]}. */
public class ErroValidacao extends RuntimeException {

    private final String campo;
    private final String codigoCampo;

    private ErroValidacao(String campo, String codigoCampo) {
        super(MensagensApi.MENSAGEM_CAMPO_INVALIDO);
        this.campo = campo;
        this.codigoCampo = codigoCampo;
    }

    public String campo() {
        return campo;
    }

    public String codigoCampo() {
        return codigoCampo;
    }

    public static ErroValidacao tamanhoExcedido(String campo) {
        return new ErroValidacao(campo, MensagensApi.CODIGO_TAMANHO_EXCEDIDO);
    }

    public static ErroValidacao obrigatorio(String campo) {
        return new ErroValidacao(campo, MensagensApi.CODIGO_OBRIGATORIO);
    }

    public static ErroValidacao invalido(String campo) {
        return new ErroValidacao(campo, MensagensApi.CODIGO_INVALIDO);
    }

    public static ErroValidacao senhaForaDaPolitica() {
        return new ErroValidacao(MensagensApi.CAMPO_SENHA, MensagensApi.CODIGO_SENHA_FORA_DA_POLITICA);
    }
}
