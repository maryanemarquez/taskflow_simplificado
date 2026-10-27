package com.taskflow.auth.controller;

import com.taskflow.erro.CodigoErroApi;
import com.taskflow.erro.ErroDeAplicacao;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class UsuarioAutenticadoResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parametro) {
        return parametro.hasParameterAnnotation(UsuarioAutenticado.class);
    }

    @Override
    public Object resolveArgument(
            MethodParameter parametro,
            ModelAndViewContainer container,
            NativeWebRequest requisicao,
            WebDataBinderFactory fabrica) {
        Object usuarioId = requisicao.getAttribute(
                AutenticacaoInterceptor.ATRIBUTO_USUARIO_ID, RequestAttributes.SCOPE_REQUEST);
        if (usuarioId == null) {
            throw new ErroDeAplicacao(CodigoErroApi.NAO_AUTENTICADO);
        }
        return usuarioId;
    }
}
