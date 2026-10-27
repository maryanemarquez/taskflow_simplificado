package com.taskflow.validacao;

import com.taskflow.erro.CampoApi;
import com.taskflow.erro.ErroDeAplicacao;
import java.util.Locale;
import java.util.regex.Pattern;

/** Validações simples de texto, contando caracteres Unicode (code points). */
public final class Campos {

    private static final Pattern FORMATO_EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private Campos() {
    }

    public static String textoObrigatorio(String valor, CampoApi campo, int maximo) {
        String texto = valor == null ? "" : valor.trim();
        if (texto.isEmpty()) {
            throw ErroDeAplicacao.obrigatorio(campo);
        }
        validarTamanho(texto, campo, maximo);
        return texto;
    }

    /**
     * Texto obrigatório com formato de e-mail, já normalizado (sem espaços e em minúsculas).
     * O limite de tamanho é avaliado antes do formato.
     */
    public static String emailObrigatorio(String valor, CampoApi campo, int maximo) {
        String texto = textoObrigatorio(valor, campo, maximo);
        if (!FORMATO_EMAIL.matcher(texto).matches()) {
            throw ErroDeAplicacao.invalido(campo);
        }
        return normalizarEmail(texto);
    }

    public static String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public static String textoOpcional(String valor, CampoApi campo, int maximo) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        String texto = valor.trim();
        validarTamanho(texto, campo, maximo);
        return texto;
    }

    /** Converte o texto para a constante do enum, sem diferenciar maiúsculas de minúsculas. */
    public static <E extends Enum<E>> E enumObrigatorio(String valor, Class<E> tipo, CampoApi campo) {
        if (valor == null || valor.isBlank()) {
            throw ErroDeAplicacao.obrigatorio(campo);
        }
        try {
            return Enum.valueOf(tipo, valor.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException erro) {
            throw ErroDeAplicacao.invalido(campo);
        }
    }

    private static void validarTamanho(String texto, CampoApi campo, int maximo) {
        if (texto.codePointCount(0, texto.length()) > maximo) {
            throw ErroDeAplicacao.tamanhoExcedido(campo);
        }
    }
}
