package com.taskflow.erro;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ControladorErroTeste {

    @GetMapping("/teste/erros/tratado")
    void erroTratado() {
        throw new ErroDeAplicacao(
                CodigoErroApi.VALIDACAO,
                new IllegalArgumentException("SQL_INTERNO_TESTE TOKEN_INTERNO_TESTE"));
    }

    @GetMapping("/teste/erros/concorrencia")
    void conflitoDeConcorrencia() {
        throw new ObjectOptimisticLockingFailureException(Object.class, 1L);
    }

    @GetMapping("/teste/erros/inesperado")
    void erroInesperado() {
        throw new IllegalStateException("SQL_INTERNO_TESTE TOKEN_INTERNO_TESTE");
    }
}
