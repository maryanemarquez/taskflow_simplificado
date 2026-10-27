package com.taskflow.auth;

import com.taskflow.configuracao.PropriedadesCors;
import com.taskflow.configuracao.Rotas;
import com.taskflow.erro.CorrelacaoFiltro;
import java.util.List;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableConfigurationProperties(PropriedadesCors.class)
public class ConfiguracaoWeb implements WebMvcConfigurer {

    private final AutenticacaoInterceptor autenticacaoInterceptor;
    private final UsuarioAutenticadoResolver usuarioAutenticadoResolver;
    private final String origemPermitida;

    public ConfiguracaoWeb(
            AutenticacaoInterceptor autenticacaoInterceptor,
            UsuarioAutenticadoResolver usuarioAutenticadoResolver,
            PropriedadesCors cors) {
        this.autenticacaoInterceptor = autenticacaoInterceptor;
        this.usuarioAutenticadoResolver = usuarioAutenticadoResolver;
        this.origemPermitida = cors.origem();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(autenticacaoInterceptor)
                .addPathPatterns(Rotas.PREFIXO_API + "/**")
                .excludePathPatterns(Rotas.PREFIXO_AUTH + "/**");
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(usuarioAutenticadoResolver);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping(Rotas.PREFIXO_API + "/**")
                .allowedOrigins(origemPermitida)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders(CorrelacaoFiltro.CABECALHO);
    }
}
