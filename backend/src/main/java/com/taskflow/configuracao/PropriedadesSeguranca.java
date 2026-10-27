package com.taskflow.configuracao;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/** Propriedades {@code taskflow.security.*}. */
@ConfigurationProperties("taskflow.security")
public record PropriedadesSeguranca(@DefaultValue("12") int bcryptStrength, Jwt jwt) {

    public record Jwt(String secret) {
    }
}
