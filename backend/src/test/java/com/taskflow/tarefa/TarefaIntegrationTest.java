package com.taskflow.tarefa;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.taskflow.TesteIntegracaoBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TarefaIntegrationTest extends TesteIntegracaoBase {

    private static final String TAREFAS = "/api/tarefas";

    @Test
    @DisplayName("HIST-001-tarefa/C01 - Membro cria tarefa para si, mesmo informando outro responsável")
    void membroCriaTarefaParaSi() throws Exception {
        String dono = cadastrar("Dono", "dono.c01@taskflow.invalid");
        String membro = entrarNaEquipe(dono, "Bia", "bia.c01@taskflow.invalid");
        long idDono = idDoUsuario("dono.c01@taskflow.invalid");

        enviar("POST", TAREFAS, membro,
                "{\"titulo\":\"Escrever relatório\",\"descricao\":\"Primeira versão\",\"responsavelId\":" + idDono + "}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titulo").value("Escrever relatório"))
                .andExpect(jsonPath("$.status").value("PENDENTE"))
                .andExpect(jsonPath("$.responsavel.nome").value("Bia"));

        assertThat(jdbcTemplate.queryForObject(
                "SELECT criado_por_id FROM tarefa", Long.class)).isEqualTo(idDoUsuario("bia.c01@taskflow.invalid"));
    }

    @Test
    @DisplayName("HIST-001-tarefa/C02 - Dono cria tarefa para um membro")
    void donoCriaTarefaParaMembro() throws Exception {
        String dono = cadastrar("Dono", "dono.c02@taskflow.invalid");
        entrarNaEquipe(dono, "Bia", "bia.c02@taskflow.invalid");

        enviar("POST", TAREFAS, dono,
                "{\"titulo\":\"Revisar\",\"prazo\":\"2026-12-31\",\"responsavelId\":"
                        + idDoUsuario("bia.c02@taskflow.invalid") + "}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.responsavel.nome").value("Bia"))
                .andExpect(jsonPath("$.prazo").value("2026-12-31"));
    }

    @Test
    @DisplayName("HIST-001-tarefa/C03 - Dono cria tarefa sem informar responsável")
    void donoSemResponsavelFicaComATarefa() throws Exception {
        String dono = cadastrar("Dono", "dono.c03@taskflow.invalid");

        enviar("POST", TAREFAS, dono, json("titulo", "Sozinho"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.responsavel.nome").value("Dono"));
    }

    @Test
    @DisplayName("HIST-001-tarefa/C04 - rejeita responsável de outra equipe")
    void rejeitaResponsavelDeOutraEquipe() throws Exception {
        String dono = cadastrar("Dono", "dono.c04@taskflow.invalid");
        cadastrar("Estranha", "estranha.c04@taskflow.invalid");

        enviar("POST", TAREFAS, dono,
                "{\"titulo\":\"X\",\"responsavelId\":" + idDoUsuario("estranha.c04@taskflow.invalid") + "}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACAO"))
                .andExpect(jsonPath("$.erros[0].campo").value("responsavelId"));
        enviar("POST", TAREFAS, dono, "{\"titulo\":\"X\",\"responsavelId\":999999}")
                .andExpect(status().isBadRequest());

        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tarefa", Integer.class)).isZero();
    }

    @Test
    @DisplayName("HIST-001-tarefa/C05 - aceita título com 150 caracteres e rejeita 151")
    void limiteDoTitulo() throws Exception {
        String dono = cadastrar("Dono", "dono.c05@taskflow.invalid");

        enviar("POST", TAREFAS, dono, json("titulo", "t".repeat(150))).andExpect(status().isCreated());
        enviar("POST", TAREFAS, dono, json("titulo", "t".repeat(151)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros[0].campo").value("titulo"))
                .andExpect(jsonPath("$.erros[0].codigo").value("TAMANHO_EXCEDIDO"));
        enviar("POST", TAREFAS, dono, json("titulo", "x", "descricao", "d".repeat(2001)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros[0].campo").value("descricao"));
    }

    @Test
    @DisplayName("HIST-001-tarefa/C06 - rejeita título vazio")
    void rejeitaTituloVazio() throws Exception {
        String dono = cadastrar("Dono", "dono.c06@taskflow.invalid");

        enviar("POST", TAREFAS, dono, json("titulo", "   "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACAO"));
        enviar("POST", TAREFAS, dono, "{}").andExpect(status().isBadRequest());
        enviar("POST", TAREFAS, dono, "{\"titulo\":\"X\",\"prazo\":\"amanhã\"}")
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("HIST-001-tarefa/C07 - lista só as tarefas da própria equipe")
    void listaSoTarefasDaPropriaEquipe() throws Exception {
        String dono = cadastrar("Dono", "dono.c07@taskflow.invalid");
        String membro = entrarNaEquipe(dono, "Bia", "bia.c07@taskflow.invalid");
        String outraEquipe = cadastrar("Outra", "outra.c07@taskflow.invalid");
        criarTarefa(dono, "Primeira", null);
        criarTarefa(membro, "Segunda", null);
        criarTarefa(outraEquipe, "De outra equipe", null);

        enviar("GET", TAREFAS, membro, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].titulo", contains("Primeira", "Segunda")));
    }

    @Test
    @DisplayName("HIST-001-tarefa/C08 - Membro edita só a tarefa pela qual é responsável")
    void membroEditaSoAPropriaTarefa() throws Exception {
        String dono = cadastrar("Dono", "dono.c08@taskflow.invalid");
        String membro = entrarNaEquipe(dono, "Bia", "bia.c08@taskflow.invalid");
        long minha = criarTarefa(membro, "Minha", null);
        long doDono = criarTarefa(dono, "Do dono", null);

        enviar("PUT", TAREFAS + "/" + minha, membro, json("titulo", "Minha editada", "descricao", "nova"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Minha editada"))
                .andExpect(jsonPath("$.descricao").value("nova"));
        enviar("PUT", TAREFAS + "/" + doDono, membro, json("titulo", "Invasão"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("SEM_PERMISSAO"));
        enviar("PUT", TAREFAS + "/" + doDono, dono, json("titulo", "Dono edita"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("HIST-001-tarefa/C09 - só o Dono altera o responsável")
    void soODonoAlteraOResponsavel() throws Exception {
        String dono = cadastrar("Dono", "dono.c09@taskflow.invalid");
        String membro = entrarNaEquipe(dono, "Bia", "bia.c09@taskflow.invalid");
        long idDono = idDoUsuario("dono.c09@taskflow.invalid");
        long idBia = idDoUsuario("bia.c09@taskflow.invalid");
        long tarefa = criarTarefa(membro, "Minha", null);

        enviar("PUT", TAREFAS + "/" + tarefa, membro, "{\"titulo\":\"Minha\",\"responsavelId\":" + idDono + "}")
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("SEM_PERMISSAO"));
        enviar("PUT", TAREFAS + "/" + tarefa, dono, "{\"titulo\":\"Minha\",\"responsavelId\":" + idDono + "}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.responsavel.id").value(idDono));
        enviar("PUT", TAREFAS + "/" + tarefa, membro, "{\"titulo\":\"Ainda minha?\",\"responsavelId\":" + idBia + "}")
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("HIST-001-tarefa/C10 - só o Dono remove tarefa")
    void soODonoRemoveTarefa() throws Exception {
        String dono = cadastrar("Dono", "dono.c10@taskflow.invalid");
        String membro = entrarNaEquipe(dono, "Bia", "bia.c10@taskflow.invalid");
        long tarefa = criarTarefa(membro, "Minha", null);

        enviar("DELETE", TAREFAS + "/" + tarefa, membro, null)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("SEM_PERMISSAO"));
        enviar("DELETE", TAREFAS + "/" + tarefa, dono, null).andExpect(status().isNoContent());

        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tarefa", Integer.class)).isZero();
    }

    @Test
    @DisplayName("HIST-001-tarefa/C11 - tarefa de outra equipe não é acessível")
    void tarefaDeOutraEquipeNaoEhAcessivel() throws Exception {
        String dono = cadastrar("Dono", "dono.c11@taskflow.invalid");
        String outroDono = cadastrar("Outro", "outro.c11@taskflow.invalid");
        long tarefa = criarTarefa(dono, "Privada", null);

        enviar("PUT", TAREFAS + "/" + tarefa, outroDono, json("titulo", "Invasão"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("TAREFA_NAO_ENCONTRADA"));
        enviar("DELETE", TAREFAS + "/" + tarefa, outroDono, null)
                .andExpect(status().isNotFound());
        enviar("DELETE", TAREFAS + "/999999", dono, null)
                .andExpect(status().isNotFound());
        enviar("PUT", TAREFAS + "/abc", dono, json("titulo", "x"))
                .andExpect(status().isBadRequest());
    }
}
