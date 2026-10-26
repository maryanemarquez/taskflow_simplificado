package com.taskflow.equipe;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.taskflow.TesteIntegracaoBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MembroIntegrationTest extends TesteIntegracaoBase {

    @Test
    @DisplayName("HIST-001-equipe/C01 - lista só os membros da própria equipe")
    void listaSoMembrosDaPropriaEquipe() throws Exception {
        String dono = cadastrar("Dono", "dono.c01@taskflow.invalid");
        String membro = entrarNaEquipe(dono, "Bia", "bia.c01@taskflow.invalid");
        entrarNaEquipe(dono, "Caio", "caio.c01@taskflow.invalid");
        cadastrar("Outro", "outro.c01@taskflow.invalid");

        enviar("GET", "/api/membros", membro, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[*].email", containsInAnyOrder(
                        "dono.c01@taskflow.invalid", "bia.c01@taskflow.invalid", "caio.c01@taskflow.invalid")));
    }

    @Test
    @DisplayName("HIST-001-equipe/C02 - Dono adiciona conta existente sem equipe")
    void donoAdicionaContaSemEquipe() throws Exception {
        String dono = cadastrar("Dono", "dono.c02@taskflow.invalid");
        cadastrarMembro("Bia", "bia.c02@taskflow.invalid");

        enviar("POST", "/api/membros", dono, json("email", "Bia.C02@taskflow.invalid"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.papel").value("MEMBRO"))
                .andExpect(jsonPath("$.email").value("bia.c02@taskflow.invalid"));

        assertThat(jdbcTemplate.queryForObject(
                "SELECT papel FROM usuario WHERE email = ?", String.class, "bia.c02@taskflow.invalid"))
                .isEqualTo("MEMBRO");
    }

    @Test
    @DisplayName("HIST-001-equipe/C03 - e-mail sem conta responde 404")
    void emailSemContaResponde404() throws Exception {
        String dono = cadastrar("Dono", "dono.c03@taskflow.invalid");

        enviar("POST", "/api/membros", dono, json("email", "ninguem@taskflow.invalid"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("USUARIO_NAO_ENCONTRADO"));
        enviar("POST", "/api/membros", dono, json("email", "  "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACAO"));
    }

    @Test
    @DisplayName("HIST-001-equipe/C04 - conta que já tem equipe responde 409")
    void contaComEquipeResponde409() throws Exception {
        String dono = cadastrar("Dono", "dono.c04@taskflow.invalid");
        cadastrar("Bia", "bia.c04@taskflow.invalid");

        enviar("POST", "/api/membros", dono, json("email", "bia.c04@taskflow.invalid"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("USUARIO_JA_TEM_EQUIPE"));
        enviar("POST", "/api/membros", dono, json("email", "dono.c04@taskflow.invalid"))
                .andExpect(status().isConflict());

        assertThat(jdbcTemplate.queryForObject(
                "SELECT papel FROM usuario WHERE email = ?", String.class, "bia.c04@taskflow.invalid"))
                .isEqualTo("DONO");
    }

    @Test
    @DisplayName("HIST-001-equipe/C05 - Membro não adiciona nem remove")
    void membroNaoAdicionaNemRemove() throws Exception {
        String dono = cadastrar("Dono", "dono.c05@taskflow.invalid");
        String membro = entrarNaEquipe(dono, "Bia", "bia.c05@taskflow.invalid");
        cadastrar("Livre", "livre.c05@taskflow.invalid");

        enviar("POST", "/api/membros", membro, json("email", "livre.c05@taskflow.invalid"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("SEM_PERMISSAO"));
        enviar("DELETE", "/api/membros/" + idDoUsuario("dono.c05@taskflow.invalid"), membro, null)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("SEM_PERMISSAO"));
    }

    @Test
    @DisplayName("HIST-001-equipe/C06 - remover membro reatribui tarefas ao Dono")
    void removerMembroReatribuiTarefasAoDono() throws Exception {
        String dono = cadastrar("Dono", "dono.c06@taskflow.invalid");
        entrarNaEquipe(dono, "Bia", "bia.c06@taskflow.invalid");
        long idBia = idDoUsuario("bia.c06@taskflow.invalid");
        long idDono = idDoUsuario("dono.c06@taskflow.invalid");
        criarTarefa(dono, "Primeira", idBia);
        criarTarefa(dono, "Segunda", idBia);
        criarTarefa(dono, "Do dono", idDono);

        enviar("DELETE", "/api/membros/" + idBia, dono, null).andExpect(status().isNoContent());

        assertThat(jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM tarefa WHERE responsavel_id = ?", Integer.class, idDono)).isEqualTo(3);
        assertThat(jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM tarefa WHERE responsavel_id = ?", Integer.class, idBia)).isZero();
        assertThat(jdbcTemplate.queryForObject(
                "SELECT equipe_id FROM usuario WHERE id = ?", Long.class, idBia)).isNull();
        assertThat(jdbcTemplate.queryForObject(
                "SELECT papel FROM usuario WHERE id = ?", String.class, idBia)).isNull();
    }

    @Test
    @DisplayName("HIST-001-equipe/C06 - não remove quem é de outra equipe")
    void naoRemoveMembroDeOutraEquipe() throws Exception {
        String dono = cadastrar("Dono", "dono.c06b@taskflow.invalid");
        cadastrar("Estranha", "estranha.c06b@taskflow.invalid");

        enviar("DELETE", "/api/membros/" + idDoUsuario("estranha.c06b@taskflow.invalid"), dono, null)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("USUARIO_NAO_ENCONTRADO"));
    }

    @Test
    @DisplayName("HIST-001-equipe/C08 - o Dono não pode ser removido")
    void donoNaoPodeSerRemovido() throws Exception {
        String dono = cadastrar("Dono", "dono.c08@taskflow.invalid");

        enviar("DELETE", "/api/membros/" + idDoUsuario("dono.c08@taskflow.invalid"), dono, null)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("DONO_NAO_PODE_SER_REMOVIDO"));
    }

    @Test
    @DisplayName("HIST-001-equipe/C09 - usuário sem equipe é bloqueado")
    void usuarioSemEquipeEhBloqueado() throws Exception {
        String dono = cadastrar("Dono", "dono.c09@taskflow.invalid");
        String membro = entrarNaEquipe(dono, "Bia", "bia.c09@taskflow.invalid");
        enviar("DELETE", "/api/membros/" + idDoUsuario("bia.c09@taskflow.invalid"), dono, null)
                .andExpect(status().isNoContent());

        enviar("GET", "/api/membros", membro, null)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("SEM_EQUIPE"));
        enviar("GET", "/api/tarefas", membro, null)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("SEM_EQUIPE"));
        enviar("GET", "/api/me", membro, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.equipe").doesNotExist());
    }

    @Test
    @DisplayName("HIST-001-equipe/C10 - membro removido volta a operar ao ser readicionado")
    void membroRemovidoVoltaAoSerReadicionado() throws Exception {
        String dono = cadastrar("Dono", "dono.c10@taskflow.invalid");
        String membro = entrarNaEquipe(dono, "Bia", "bia.c10@taskflow.invalid");
        enviar("DELETE", "/api/membros/" + idDoUsuario("bia.c10@taskflow.invalid"), dono, null)
                .andExpect(status().isNoContent());

        enviar("POST", "/api/membros", dono, json("email", "bia.c10@taskflow.invalid"))
                .andExpect(status().isCreated());

        enviar("GET", "/api/membros", membro, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @DisplayName("HIST-001-equipe/C11 - Membro que se cadastrou é adicionado pelo Dono e passa a operar")
    void membroCadastradoEhAdicionadoPeloDono() throws Exception {
        String dono = cadastrar("Dono", "dono.c11@taskflow.invalid");
        String membro = cadastrarMembro("Bia", "bia.c11@taskflow.invalid");
        enviar("GET", "/api/membros", membro, null)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("SEM_EQUIPE"));

        enviar("POST", "/api/membros", dono, json("email", "bia.c11@taskflow.invalid"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.papel").value("MEMBRO"));

        enviar("GET", "/api/membros", membro, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
        enviar("GET", "/api/me", membro, null)
                .andExpect(jsonPath("$.equipe.papel").value("MEMBRO"));
    }

    @Test
    @DisplayName("HIST-001-equipe/C12 - Membro sem equipe não cria tarefa nem equipe")
    void membroSemEquipeNaoCriaTarefaNemEquipe() throws Exception {
        String membro = cadastrarMembro("Bia", "bia.c12@taskflow.invalid");

        enviar("POST", "/api/tarefas", membro, json("titulo", "Tentativa"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("SEM_EQUIPE"));
        // Não existe rota para criar equipe: qualquer tentativa é recusada.
        enviar("POST", "/api/equipes", membro, json("nome", "Minha equipe"))
                .andExpect(status().is4xxClientError());

        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM equipe", Integer.class)).isZero();
    }
}
