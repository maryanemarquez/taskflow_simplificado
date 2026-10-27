package com.taskflow.configuracao;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableConfigurationProperties(PropriedadesSeguranca.class)
public class ConfiguracaoSeguranca {

    @Bean
    PasswordEncoder passwordEncoder(PropriedadesSeguranca propriedades) {
        return new BCryptPasswordEncoder(propriedades.bcryptStrength());
    }
}
