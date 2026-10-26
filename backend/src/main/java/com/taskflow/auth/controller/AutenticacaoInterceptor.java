package com.taskflow.auth.controller;

import com.taskflow.auth.service.JwtService;
import com.taskflow.dominio.UsuarioRepository;
import com.taskflow.erro.CodigoErroApi;
import com.taskflow.erro.ErroDeAplicacao;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.servlet.HandlerInterceptor;

/** Exige JWT válido nas rotas protegidas e publica o id do usuário na requisição. */
@Component
public class AutenticacaoInterceptor implements HandlerInterceptor {

    public static final String ATRIBUTO_USUARIO_ID = "taskflow.usuarioId";
    private static final String PREFIXO_BEARER = "Bearer ";

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public AutenticacaoInterceptor(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
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
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ErroDeAplicacao(CodigoErroApi.NAO_AUTENTICADO);
        }
        requisicao.setAttribute(ATRIBUTO_USUARIO_ID, usuarioId);
        return true;
    }
}
