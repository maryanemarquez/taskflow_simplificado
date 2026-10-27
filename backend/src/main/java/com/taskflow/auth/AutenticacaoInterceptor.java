package com.taskflow.auth;

import com.taskflow.erro.CodigoErroApi;
import com.taskflow.erro.ErroDeAplicacao;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Exige JWT válido nas rotas protegidas e publica o id do usuário na requisição. A existência do
 * usuário é verificada por quem o carrega (serviços), que respondem {@code NAO_AUTENTICADO}.
 */
@Component
public class AutenticacaoInterceptor implements HandlerInterceptor {

    public static final String ATRIBUTO_USUARIO_ID = "taskflow.usuarioId";
    private static final String PREFIXO_BEARER = "Bearer ";

    private final JwtService jwtService;

    public AutenticacaoInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest requisicao, HttpServletResponse resposta, Object handler) {
        if (CorsUtils.isPreFlightRequest(requisicao)) {
            return true;
        }
        String cabecalho = requisicao.getHeader("Authorization");
        if (cabecalho == null || !cabecalho.startsWith(PREFIXO_BEARER)) {
            throw new ErroDeAplicacao(CodigoErroApi.NAO_AUTENTICADO);
        }
        long usuarioId = jwtService.validar(cabecalho.substring(PREFIXO_BEARER.length()).trim());
        requisicao.setAttribute(ATRIBUTO_USUARIO_ID, usuarioId);
        return true;
    }
}
