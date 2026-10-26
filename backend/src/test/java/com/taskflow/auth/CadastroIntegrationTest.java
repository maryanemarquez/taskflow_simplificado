package com.taskflow.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.taskflow.TesteIntegracaoBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;

class CadastroIntegrationTest extends TesteIntegracaoBase {

    private static final String CADASTRO = "/api/auth/cadastro";
    private static final String SENHA_72_BYTES = "a1" + "á".repeat(35);
    private static final String SENHA_73_BYTES = SENHA_72_BYTES + "a";

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("HIST-001-auth/C01 - cadastro válido cria usuário e equipe")
    void cadastroValidoCriaUsuarioEEquipe() throws Exception {
        enviar("POST", CADASTRO, null, json("nome", "Ana", "email", "ana.c01@taskflow.invalid", "senha", "senha1234", "tipo", "DONO"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipo").value("Bearer"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.accessTokenExpiraEm").isNotEmpty());

        assertThat(contar("usuario")).isEqualTo(1);
        assertThat(contar("equipe")).isEqualTo(1);
        assertThat(jdbcTemplate.queryForObject("SELECT nome FROM equipe", String.class))
                .isEqualTo("Equipe de Ana");
        assertThat(jdbcTemplate.queryForObject("SELECT papel FROM usuario", String.class)).isEqualTo("DONO");
        String hash = jdbcTemplate.queryForObject("SELECT senha_hash FROM usuario", String.class);
        assertThat(hash).isNotEqualTo("senha1234");
        assertThat(passwordEncoder.matches("senha1234", hash)).isTrue();
    }

    @Test
    @DisplayName("HIST-001-auth/C02 - cadastro normaliza o e-mail")
    void cadastroNormalizaEmail() throws Exception {
        enviar("POST", CADASTRO, null, json("nome", "Ana", "email", "  Ana@Mail.com ", "senha", "senha1234", "tipo", "DONO"))
                .andExpect(status().isCreated());

        assertThat(jdbcTemplate.queryForObject("SELECT email FROM usuario", String.class))
                .isEqualTo("ana@mail.com");
    }

    @Test
    @DisplayName("HIST-001-auth/C03 - aceita senha com exatamente 72 bytes")
    void aceitaSenhaDe72Bytes() throws Exception {
        enviar("POST", CADASTRO, null, json("nome", "Ana", "email", "c03@taskflow.invalid", "senha", SENHA_72_BYTES, "tipo", "DONO"))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("HIST-001-auth/C04 - rejeita senha com 73 bytes")
    void rejeitaSenhaDe73Bytes() throws Exception {
        enviar("POST", CADASTRO, null, json("nome", "Ana", "email", "c04@taskflow.invalid", "senha", SENHA_73_BYTES, "tipo", "DONO"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACAO"))
                .andExpect(jsonPath("$.erros[0].campo").value("senha"))
                .andExpect(jsonPath("$.erros[0].codigo").value("TAMANHO_EXCEDIDO"));

        assertThat(contar("usuario")).isZero();
        assertThat(contar("equipe")).isZero();
    }

    @Test
    @DisplayName("HIST-001-auth/C05 - rejeita senha sem número ou com 7 caracteres")
    void rejeitaSenhaForaDaPolitica() throws Exception {
        for (String senha : new String[] {"somenteletras", "abc1234"}) {
            enviar("POST", CADASTRO, null, json("nome", "Ana", "email", "c05@taskflow.invalid", "senha", senha, "tipo", "DONO"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.codigo").value("VALIDACAO"))
                    .andExpect(jsonPath("$.erros", hasSize(1)))
                    .andExpect(jsonPath("$.erros[0].codigo").value("SENHA_FORA_DA_POLITICA"));
        }
        assertThat(contar("usuario")).isZero();
        assertThat(contar("equipe")).isZero();
    }

    @Test
    @DisplayName("HIST-001-auth/C06 - rejeita nome ou e-mail acima do limite")
    void rejeitaNomeOuEmailAcimaDoLimite() throws Exception {
        enviar("POST", CADASTRO, null, json("nome", "n".repeat(101), "email", "c06@taskflow.invalid", "senha", "senha1234", "tipo", "DONO"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros[0].campo").value("nome"))
                .andExpect(jsonPath("$.erros[0].codigo").value("TAMANHO_EXCEDIDO"));
        enviar("POST", CADASTRO, null, json("nome", "Ana", "email", "e".repeat(145) + "@a.com", "senha", "senha1234", "tipo", "DONO"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros[0].campo").value("email"))
                .andExpect(jsonPath("$.erros[0].codigo").value("TAMANHO_EXCEDIDO"));

        assertThat(contar("usuario")).isZero();
    }

    @Test
    @DisplayName("HIST-001-auth/C07 - rejeita e-mail já cadastrado")
    void rejeitaEmailJaCadastrado() throws Exception {
        cadastrar("Ana", "c07@taskflow.invalid");

        enviar("POST", CADASTRO, null, json("nome", "Outra", "email", "C07@taskflow.invalid", "senha", "senha1234", "tipo", "DONO"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("EMAIL_JA_CADASTRADO"));

        assertThat(contar("usuario")).isEqualTo(1);
        assertThat(contar("equipe")).isEqualTo(1);
    }

    @Test
    @DisplayName("HIST-001-auth/C06 - corpo sem campos obrigatórios responde 400")
    void corpoSemCamposResponde400() throws Exception {
        enviar("POST", CADASTRO, null, "{}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACAO"));
        enviar("POST", CADASTRO, null, "isto não é json")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACAO"));
    }

    @Test
    @DisplayName("HIST-001-auth/C14 - cadastro como Membro cria só o usuário, sem equipe e sem papel")
    void cadastroComoMembroCriaContaSemEquipe() throws Exception {
        enviar("POST", CADASTRO, null, json("nome", "Bia", "email", "c14@taskflow.invalid",
                "senha", "senha1234", "tipo", "MEMBRO"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());

        assertThat(contar("usuario")).isEqualTo(1);
        assertThat(contar("equipe")).isZero();
        assertThat(jdbcTemplate.queryForObject("SELECT equipe_id FROM usuario", Long.class)).isNull();
        assertThat(jdbcTemplate.queryForObject("SELECT papel FROM usuario", String.class)).isNull();
    }

    @Test
    @DisplayName("HIST-001-auth/C14 - /me de quem se cadastrou como Membro traz equipe nula")
    void meDeMembroRecemCadastradoTrazEquipeNula() throws Exception {
        String token = cadastrarMembro("Bia", "c14b@taskflow.invalid");

        enviar("GET", "/api/me", token, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario.email").value("c14b@taskflow.invalid"))
                .andExpect(jsonPath("$.equipe").doesNotExist());
    }

    @Test
    @DisplayName("HIST-001-auth/C15 - tipo ausente é rejeitado")
    void rejeitaTipoAusente() throws Exception {
        enviar("POST", CADASTRO, null, json("nome", "Ana", "email", "c15@taskflow.invalid", "senha", "senha1234"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACAO"))
                .andExpect(jsonPath("$.erros[0].campo").value("tipo"))
                .andExpect(jsonPath("$.erros[0].codigo").value("OBRIGATORIO"));

        assertThat(contar("usuario")).isZero();
        assertThat(contar("equipe")).isZero();
    }

    @Test
    @DisplayName("HIST-001-auth/C16 - tipo desconhecido é rejeitado")
    void rejeitaTipoDesconhecido() throws Exception {
        enviar("POST", CADASTRO, null, json("nome", "Ana", "email", "c16@taskflow.invalid",
                "senha", "senha1234", "tipo", "ADMIN"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros[0].campo").value("tipo"))
                .andExpect(jsonPath("$.erros[0].codigo").value("INVALIDO"));

        assertThat(contar("usuario")).isZero();
        assertThat(contar("equipe")).isZero();
    }

    @Test
    @DisplayName("HIST-001-auth/C17 - e-mail com formato inválido é rejeitado")
    void rejeitaEmailComFormatoInvalido() throws Exception {
        for (String email : new String[] {"semarroba", "a@b", "a b@c.com"}) {
            enviar("POST", CADASTRO, null, json("nome", "Ana", "email", email, "senha", "senha1234", "tipo", "DONO"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.erros[0].campo").value("email"))
                    .andExpect(jsonPath("$.erros[0].codigo").value("INVALIDO"));
        }
        assertThat(contar("usuario")).isZero();
    }

    private int contar(String tabela) {
        return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tabela, Integer.class);
    }
}
