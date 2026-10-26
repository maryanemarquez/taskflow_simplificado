package com.taskflow.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.taskflow.TesteIntegracaoBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;

/** O hash gerado é maior que a coluna, então o usuário falha depois de a equipe ser gravada. */
@Import(CadastroAtomicoIntegrationTest.EncoderQuebrado.class)
class CadastroAtomicoIntegrationTest extends TesteIntegracaoBase {

    @Test
    @DisplayName("HIST-001-auth/C08 - desfaz tudo quando a criação falha")
    void desfazTudoQuandoACriacaoFalha() throws Exception {
        int resposta = enviar("POST", "/api/auth/cadastro", null,
                json("nome", "Ana", "email", "c08@taskflow.invalid", "senha", "senha1234", "tipo", "DONO"))
                .andReturn().getResponse().getStatus();

        assertThat(resposta).isNotEqualTo(201);

        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM usuario", Integer.class)).isZero();
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM equipe", Integer.class)).isZero();
    }

    @TestConfiguration
    static class EncoderQuebrado {

        @Bean
        @Primary
        PasswordEncoder encoderQuebrado() {
            return new PasswordEncoder() {
                @Override
                public String encode(CharSequence senha) {
                    return "x".repeat(300);
                }

                @Override
                public boolean matches(CharSequence senha, String hash) {
                    return false;
                }
            };
        }
    }
}
