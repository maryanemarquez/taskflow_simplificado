package com.taskflow.validacao;

import com.taskflow.erro.CampoApi;
import com.taskflow.erro.ErroDeAplicacao;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

/** Política de senha: até 72 bytes (limite do BCrypt), mínimo de 8 caracteres, com letra e número. */
public final class PoliticaSenha {

    private static final int MINIMO_CARACTERES = 8;
    private static final int MAXIMO_BYTES = 72;
    private static final Pattern CONTEM_LETRA = Pattern.compile(".*\\p{L}.*");
    private static final Pattern CONTEM_NUMERO = Pattern.compile(".*\\d.*");

    private PoliticaSenha() {
    }

    public static void validar(String senha) {
        if (senha == null || senha.isEmpty()) {
            throw ErroDeAplicacao.obrigatorio(CampoApi.SENHA);
        }
        if (senha.getBytes(StandardCharsets.UTF_8).length > MAXIMO_BYTES) {
            throw ErroDeAplicacao.tamanhoExcedido(CampoApi.SENHA);
        }
        if (senha.codePointCount(0, senha.length()) < MINIMO_CARACTERES
                || !CONTEM_LETRA.matcher(senha).matches()
                || !CONTEM_NUMERO.matcher(senha).matches()) {
            throw ErroDeAplicacao.senhaForaDaPolitica();
        }
    }
}
