package com.taskflow.configuracao;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class ConfiguracaoTempo {

    @Bean
    public Clock clockUtc() {
        return Clock.systemUTC();
    }
}
