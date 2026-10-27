package com.taskflow.configuracao;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Propriedades {@code taskflow.cors.*}. */
@ConfigurationProperties("taskflow.cors")
public record PropriedadesCors(String origem) {
}
