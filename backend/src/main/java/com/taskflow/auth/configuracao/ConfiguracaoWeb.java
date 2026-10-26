package com.taskflow.auth.configuracao;

import com.taskflow.auth.controller.AutenticacaoInterceptor;
import com.taskflow.auth.controller.RotasAuth;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ConfiguracaoWeb implements WebMvcConfigurer {

    private final AutenticacaoInterceptor autenticacaoInterceptor;
    private final String origemPermitida;

    public ConfiguracaoWeb(
            AutenticacaoInterceptor autenticacaoInterceptor,
            @Value("${taskflow.cors.origem:http://localhost:8081}") String origemPermitida) {
        this.autenticacaoInterceptor = autenticacaoInterceptor;
        this.origemPermitida = origemPermitida;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(autenticacaoInterceptor)
                .addPathPatterns(RotasAuth.PREFIXO_API + "/**")
                .excludePathPatterns(RotasAuth.PREFIXO_AUTH + "/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping(RotasAuth.PREFIXO_API + "/**")
                .allowedOrigins(origemPermitida)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
