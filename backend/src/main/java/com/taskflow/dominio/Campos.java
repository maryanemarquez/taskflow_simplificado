package com.taskflow.dominio;

import com.taskflow.erro.ErroValidacao;
import java.util.regex.Pattern;

/** Validações simples de texto, contando caracteres Unicode (code points). */
public final class Campos {

    private static final Pattern FORMATO_EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private Campos() {
    }

    public static String textoObrigatorio(String valor, String campo, int maximo) {
        String texto = valor == null ? "" : valor.trim();
        if (texto.isEmpty()) {
            throw ErroValidacao.obrigatorio(campo);
        }
        validarTamanho(texto, campo, maximo);
        return texto;
    }

    /** Texto obrigatório com formato de e-mail; o limite de tamanho é avaliado antes do formato. */
    public static String emailObrigatorio(String valor, String campo, int maximo) {
        String texto = textoObrigatorio(valor, campo, maximo);
        if (!FORMATO_EMAIL.matcher(texto).matches()) {
            throw ErroValidacao.invalido(campo);
        }
        return texto;
    }

    public static String textoOpcional(String valor, String campo, int maximo) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        String texto = valor.trim();
        validarTamanho(texto, campo, maximo);
        return texto;
    }

    private static void validarTamanho(String texto, String campo, int maximo) {
        if (texto.codePointCount(0, texto.length()) > maximo) {
            throw ErroValidacao.tamanhoExcedido(campo);
        }
    }
}
