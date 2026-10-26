package com.taskflow;

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

    @Bean
    static BeanFactoryPostProcessor validarVariaveisObrigatorias(Environment ambiente) {
        return fabrica -> {
            ambiente.getProperty("spring.datasource.username");
            ambiente.getProperty("spring.datasource.password");
            ambiente.getProperty("taskflow.security.jwt.secret");
        };
    }
}
