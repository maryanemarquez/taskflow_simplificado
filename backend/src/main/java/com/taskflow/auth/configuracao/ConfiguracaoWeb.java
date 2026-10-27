package com.taskflow.auth.configuracao;

import com.taskflow.auth.controller.AutenticacaoInterceptor;
import com.taskflow.auth.controller.RotasAuth;
import com.taskflow.auth.controller.UsuarioAutenticadoResolver;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ConfiguracaoWeb implements WebMvcConfigurer {

    private final AutenticacaoInterceptor autenticacaoInterceptor;
    private final UsuarioAutenticadoResolver usuarioAutenticadoResolver;
    private final String origemPermitida;

    public ConfiguracaoWeb(
            AutenticacaoInterceptor autenticacaoInterceptor,
            UsuarioAutenticadoResolver usuarioAutenticadoResolver,
            @Value("${taskflow.cors.origem}") String origemPermitida) {
        this.autenticacaoInterceptor = autenticacaoInterceptor;
        this.usuarioAutenticadoResolver = usuarioAutenticadoResolver;
        this.origemPermitida = origemPermitida;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(autenticacaoInterceptor)
                .addPathPatterns(RotasAuth.PREFIXO_API + "/**")
                .excludePathPatterns(RotasAuth.PREFIXO_AUTH + "/**");
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(usuarioAutenticadoResolver);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping(RotasAuth.PREFIXO_API + "/**")
                .allowedOrigins(origemPermitida)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
