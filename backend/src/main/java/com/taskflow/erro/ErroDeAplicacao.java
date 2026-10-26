package com.taskflow.erro;

public class ErroDeAplicacao extends RuntimeException {

    private final CodigoErroApi codigo;

    public ErroDeAplicacao(CodigoErroApi codigo) {
        super(codigo.detalhe());
        this.codigo = codigo;
    }

    public ErroDeAplicacao(CodigoErroApi codigo, Throwable causa) {
        super(codigo.detalhe(), causa);
        this.codigo = codigo;
    }

    public CodigoErroApi codigo() {
        return codigo;
    }
}
