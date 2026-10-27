package com.taskflow.configuracao;

import java.util.List;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

/**
 * Falha cedo, antes de qualquer bean, quando uma variável obrigatória do ambiente está ausente.
 * Sem isso, o Hibernate falharia antes com um erro de dialeto que esconde a causa real.
 */
@Configuration(proxyBeanMethods = false)
class ValidacaoAmbiente {

    private static final List<String> PROPRIEDADES_OBRIGATORIAS = List.of(
            "spring.datasource.username",
            "spring.datasource.password",
            "taskflow.security.jwt.secret");

    /**
     * {@code getProperty} resolve os placeholders (como {@code ${DB_PASSWORD}}) e lança
     * {@code IllegalArgumentException} citando a variável quando ela não existe.
     */
    @Bean
    static BeanFactoryPostProcessor validarVariaveisObrigatorias(Environment ambiente) {
        return fabrica -> PROPRIEDADES_OBRIGATORIAS.forEach(ambiente::getProperty);
    }
}
