package com.taskflow.erro;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Garante um {@code X-Request-Id} por requisição, no MDC dos logs e na resposta. */
@Component
public class CorrelacaoFiltro extends OncePerRequestFilter {

    public static final String CABECALHO = "X-Request-Id";
    public static final String CHAVE_MDC = "requestId";
    private static final Pattern FORMATO_VALIDO = Pattern.compile("[A-Za-z0-9-]{1,64}");

    @Override
    protected void doFilterInternal(
            HttpServletRequest requisicao, HttpServletResponse resposta, FilterChain cadeia)
            throws ServletException, IOException {
        String recebido = requisicao.getHeader(CABECALHO);
        String id = recebido != null && FORMATO_VALIDO.matcher(recebido).matches()
                ? recebido
                : UUID.randomUUID().toString();
        MDC.put(CHAVE_MDC, id);
        resposta.setHeader(CABECALHO, id);
        try {
            cadeia.doFilter(requisicao, resposta);
        } finally {
            MDC.remove(CHAVE_MDC);
        }
    }
}
