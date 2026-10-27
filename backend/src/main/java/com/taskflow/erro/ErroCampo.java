package com.taskflow.erro;

import java.util.Map;

/** Falha de um campo, no formato exibido em {@code erros[]}. */
public record ErroCampo(String campo, CodigoErroCampo codigo) {

    public static ErroCampo de(CampoApi campo, CodigoErroCampo codigo) {
        return new ErroCampo(campo.nome(), codigo);
    }

    Map<String, String> paraResposta() {
        return Map.of("campo", campo, "codigo", codigo.name(), "mensagem", codigo.mensagem());
    }
}
