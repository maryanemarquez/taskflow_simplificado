package com.taskflow.auth;

import com.taskflow.TesteIntegracaoBase;
import com.taskflow.configuracao.PropriedadesSeguranca;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;

class LoginSessaoIntegrationTest extends TesteIntegracaoBase {

    @Value("${taskflow.security.jwt.secret}")
    private String segredo;

    @Test
    @DisplayName("HIST-001-auth/C09 - login válido devolve token")
    void loginValidoDevolveToken() throws Exception {
        cadastrar("Ana", "c09@taskflow.invalid");

        enviar("POST", "/api/auth/login", null, json("email", "C09@taskflow.invalid", "senha", SENHA_PADRAO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tipo").value("Bearer"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    @Test
    @DisplayName("HIST-001-auth/C10 - login inválido responde igual para senha errada e e-mail inexistente")
    void loginInvalidoRespondeIgual() throws Exception {
        cadastrar("Ana", "c10@taskflow.invalid");

        String senhaErrada = enviar("POST", "/api/auth/login", null,
                json("email", "c10@taskflow.invalid", "senha", "outraSenha9"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("CREDENCIAIS_INVALIDAS"))
                .andReturn().getResponse().getContentAsString();
        String emailInexistente = enviar("POST", "/api/auth/login", null,
                json("email", "nao.existe@taskflow.invalid", "senha", SENHA_PADRAO))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("CREDENCIAIS_INVALIDAS"))
                .andReturn().getResponse().getContentAsString();

        assertThat(emailInexistente).isEqualTo(senhaErrada);
    }

    @Test
    @DisplayName("HIST-001-auth/C10 - login sem campos responde 401")
    void loginSemCamposResponde401() throws Exception {
        enviar("POST", "/api/auth/login", null, "{}")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("CREDENCIAIS_INVALIDAS"));
    }

    @Test
    @DisplayName("HIST-001-auth/C11 - /me devolve usuário, equipe e papel sem a senha")
    void meDevolveSessaoSemSenha() throws Exception {
        String token = cadastrar("Ana", "c11@taskflow.invalid");

        enviar("GET", "/api/me", token, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario.nome").value("Ana"))
                .andExpect(jsonPath("$.usuario.email").value("c11@taskflow.invalid"))
                .andExpect(jsonPath("$.equipe.nome").value("Equipe de Ana"))
                .andExpect(jsonPath("$.equipe.papel").value("DONO"))
                .andExpect(content().string(not(containsString("senha"))))
                .andExpect(content().string(not(containsString("hash"))));
    }

    @Test
    @DisplayName("HIST-001-auth/C11 - /me de usuário sem equipe traz equipe nula")
    void meSemEquipeTrazEquipeNula() throws Exception {
        String token = cadastrarMembro("Ana", "c11b@taskflow.invalid");

        enviar("GET", "/api/me", token, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.equipe").doesNotExist());
    }

    @Test
    @DisplayName("HIST-001-auth/C12 - rota protegida sem token válido responde 401")
    void rotaProtegidaSemTokenValido() throws Exception {
        String token = cadastrar("Ana", "c12@taskflow.invalid");
        long idDoUsuario = idDoUsuario("c12@taskflow.invalid");
        String adulterado = token.substring(0, token.length() - 2) + (token.endsWith("aa") ? "bb" : "aa");
        JwtService emissorNoPassado = jwtService(
                Clock.fixed(Instant.parse("2020-01-01T00:00:00Z"), ZoneOffset.UTC), segredo);
        String expirado = emissorNoPassado.emitir(idDoUsuario).accessToken();
        String outroSegredo = jwtService(Clock.systemUTC(), "outro-segredo-completamente-diferente-123456")
                .emitir(idDoUsuario).accessToken();

        for (String invalido : new String[] {null, "", "lixo", adulterado, expirado, outroSegredo}) {
            enviar("GET", "/api/me", invalido, null)
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.codigo").value("NAO_AUTENTICADO"));
        }
        enviar("GET", "/api/membros", null, null).andExpect(status().isUnauthorized());
        enviar("GET", "/api/tarefas", null, null).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("HIST-001-auth/C12 - token de usuário que não existe mais responde 401")
    void tokenDeUsuarioInexistenteResponde401() throws Exception {
        String token = cadastrar("Ana", "c12b@taskflow.invalid");
        jdbcTemplate.update("DELETE FROM usuario");

        enviar("GET", "/api/me", token, null)
                .andExpect(status().isUnauthorized());
    }

    private static JwtService jwtService(Clock clock, String segredo) {
        return new JwtService(clock, new PropriedadesSeguranca(4, new PropriedadesSeguranca.Jwt(segredo)));
    }
}
