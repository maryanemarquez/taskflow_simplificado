package com.taskflow.erro;

import java.util.List;

/**
 * Erro previsto da aplicação. Carrega o {@link CodigoErroApi} e, nas validações, as falhas por campo
 * (viram {@code erros[]}). Não grava stack trace: é usado como controle de fluxo.
 */
public class ErroDeAplicacao extends RuntimeException {

    private final CodigoErroApi codigo;
    private final List<ErroCampo> erros;

    public ErroDeAplicacao(CodigoErroApi codigo) {
        this(codigo, List.of(), null);
    }

    public ErroDeAplicacao(CodigoErroApi codigo, Throwable causa) {
        this(codigo, List.of(), causa);
    }

    private ErroDeAplicacao(CodigoErroApi codigo, List<ErroCampo> erros, Throwable causa) {
        super(codigo.detalhe(), causa, false, false);
        this.codigo = codigo;
        this.erros = erros;
    }

    public CodigoErroApi codigo() {
        return codigo;
    }

    public List<ErroCampo> erros() {
        return erros;
    }

    public static ErroDeAplicacao validacao(List<ErroCampo> erros) {
        return new ErroDeAplicacao(CodigoErroApi.VALIDACAO, List.copyOf(erros), null);
    }

    public static ErroDeAplicacao validacao(CampoApi campo, CodigoErroCampo codigoCampo) {
        return validacao(List.of(ErroCampo.de(campo, codigoCampo)));
    }

    public static ErroDeAplicacao obrigatorio(CampoApi campo) {
        return validacao(campo, CodigoErroCampo.OBRIGATORIO);
    }

    public static ErroDeAplicacao invalido(CampoApi campo) {
        return validacao(campo, CodigoErroCampo.INVALIDO);
    }

    public static ErroDeAplicacao tamanhoExcedido(CampoApi campo) {
        return validacao(campo, CodigoErroCampo.TAMANHO_EXCEDIDO);
    }

    public static ErroDeAplicacao senhaForaDaPolitica() {
        return validacao(CampoApi.SENHA, CodigoErroCampo.SENHA_FORA_DA_POLITICA);
    }
}
