package com.taskflow.configuracao;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import com.taskflow.TaskFlowApplication;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;

class VariavelObrigatoriaIntegrationTest {

    private static final String SEGREDO_JWT_TESTE = ConfiguracaoTeste.segredoJwt();

    @Test
    @DisplayName("HIST-001-fundacao/C02 - inicialização sem DB_PASSWORD informa a variável ausente")
    void perfilFalhaQuandoVariavelObrigatoriaEstaAusente() {
        Throwable falha = catchThrowable(this::iniciarAplicacaoSemSenhaDoBanco);
        String mensagens = mensagensDasCausas(falha);

        assertThat(falha).isNotNull();
        assertThat(mensagens).contains("DB_PASSWORD");
        assertThat(mensagens).doesNotContain(SEGREDO_JWT_TESTE);
    }

    private void iniciarAplicacaoSemSenhaDoBanco() {
        ConfigurableEnvironment ambiente = ambienteSemVariaveisDoHost();
        new SpringApplicationBuilder(TaskFlowApplication.class)
                .environment(ambiente)
                .profiles("dev")
                .web(WebApplicationType.NONE)
                .run();
    }

    private ConfigurableEnvironment ambienteSemVariaveisDoHost() {
        StandardEnvironment ambiente = new StandardEnvironment();
        ambiente.getPropertySources().remove(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME);
        ambiente.getPropertySources().remove(StandardEnvironment.SYSTEM_PROPERTIES_PROPERTY_SOURCE_NAME);
        ambiente.getPropertySources().addFirst(new MapPropertySource(
                "ambiente-de-teste", variaveisDeTeste()));
        return ambiente;
    }

    private Map<String, Object> variaveisDeTeste() {
        return Map.ofEntries(
                Map.entry("DB_HOST", "localhost"),
                Map.entry("DB_PORT", "3306"),
                Map.entry("DB_NAME", "taskflow"),
                Map.entry("DB_USER", "usuario-teste"),
                Map.entry("JWT_SECRET", SEGREDO_JWT_TESTE),
                Map.entry("CORS_ORIGEM", "http://localhost:8081"));
    }

    private String mensagensDasCausas(Throwable falha) {
        StringBuilder mensagens = new StringBuilder();
        for (Throwable atual = falha; atual != null; atual = atual.getCause()) {
            if (atual.getMessage() != null) {
                mensagens.append(atual.getMessage());
            }
        }
        return mensagens.toString();
    }

}
