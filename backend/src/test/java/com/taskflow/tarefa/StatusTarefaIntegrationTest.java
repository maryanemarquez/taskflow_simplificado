package com.taskflow.tarefa;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.taskflow.TesteIntegracaoBase;
import com.taskflow.dominio.StatusTarefa;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class StatusTarefaIntegrationTest extends TesteIntegracaoBase {

    @Test
    @DisplayName("HIST-002-tarefa/C01 - responsável avança a tarefa até concluir")
    void responsavelAvancaATarefa() throws Exception {
        String dono = cadastrar("Dono", "dono.c01@taskflow.invalid");
        String membro = entrarNaEquipe(dono, "Bia", "bia.c01@taskflow.invalid");
        long tarefa = criarTarefa(membro, "Minha", null);

        mudar(membro, tarefa, "EM_ANDAMENTO").andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EM_ANDAMENTO"));
        mudar(membro, tarefa, "CONCLUIDA").andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONCLUIDA"));
    }

    @Test
    @DisplayName("HIST-002-tarefa/C02 - responsável retrocede um estágio")
    void responsavelRetrocedeUmEstagio() throws Exception {
        String dono = cadastrar("Dono", "dono.c02@taskflow.invalid");
        String membro = entrarNaEquipe(dono, "Bia", "bia.c02@taskflow.invalid");
        long tarefa = criarTarefa(membro, "Minha", null);
        mudar(membro, tarefa, "EM_ANDAMENTO");
        mudar(membro, tarefa, "CONCLUIDA");

        mudar(membro, tarefa, "EM_ANDAMENTO").andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EM_ANDAMENTO"));
        mudar(membro, tarefa, "PENDENTE").andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDENTE"));
    }

    @Test
    @DisplayName("HIST-002-tarefa/C03 - não permite pular estágio")
    void naoPermitePularEstagio() throws Exception {
        String dono = cadastrar("Dono", "dono.c03@taskflow.invalid");
        long tarefa = criarTarefa(dono, "Minha", null);

        mudar(dono, tarefa, "CONCLUIDA")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("TRANSICAO_STATUS_INVALIDA"));

        assertThat(jdbcTemplate.queryForObject("SELECT status FROM tarefa", String.class)).isEqualTo("PENDENTE");
    }

    @Test
    @DisplayName("HIST-002-tarefa/C04 - repetir o status atual não é uma transição")
    void repetirStatusAtualEhInvalido() throws Exception {
        String dono = cadastrar("Dono", "dono.c04@taskflow.invalid");
        long tarefa = criarTarefa(dono, "Minha", null);
        mudar(dono, tarefa, "EM_ANDAMENTO");

        mudar(dono, tarefa, "EM_ANDAMENTO")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("TRANSICAO_STATUS_INVALIDA"));
    }

    @Test
    @DisplayName("HIST-002-tarefa/C05 - Membro não responsável não altera o status")
    void membroNaoResponsavelNaoAltera() throws Exception {
        String dono = cadastrar("Dono", "dono.c05@taskflow.invalid");
        String membro = entrarNaEquipe(dono, "Bia", "bia.c05@taskflow.invalid");
        long tarefaDoDono = criarTarefa(dono, "Do dono", null);

        mudar(membro, tarefaDoDono, "EM_ANDAMENTO")
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("SEM_PERMISSAO"));
    }

    @Test
    @DisplayName("HIST-002-tarefa/C06 - Dono altera o status de qualquer tarefa")
    void donoAlteraQualquerTarefa() throws Exception {
        String dono = cadastrar("Dono", "dono.c06@taskflow.invalid");
        String membro = entrarNaEquipe(dono, "Bia", "bia.c06@taskflow.invalid");
        long tarefa = criarTarefa(membro, "Da Bia", null);

        mudar(dono, tarefa, "EM_ANDAMENTO").andExpect(status().isOk());
    }

    @Test
    @DisplayName("HIST-002-tarefa/C07 - status inválido e tarefa de outra equipe")
    void statusInvalidoETarefaDeOutraEquipe() throws Exception {
        String dono = cadastrar("Dono", "dono.c07@taskflow.invalid");
        String outroDono = cadastrar("Outro", "outro.c07@taskflow.invalid");
        long tarefa = criarTarefa(dono, "Minha", null);

        mudar(dono, tarefa, "FEITO")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACAO"))
                .andExpect(jsonPath("$.erros[0].campo").value("status"));
        enviar("PATCH", "/api/tarefas/" + tarefa + "/status", dono, "{}")
                .andExpect(status().isBadRequest());
        mudar(outroDono, tarefa, "EM_ANDAMENTO")
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("TAREFA_NAO_ENCONTRADA"));
    }

    @Test
    @DisplayName("HIST-002-tarefa/C03 - regra de vizinhança entre estágios")
    void regraDeVizinhanca() {
        assertThat(StatusTarefa.PENDENTE.podeIrPara(StatusTarefa.EM_ANDAMENTO)).isTrue();
        assertThat(StatusTarefa.EM_ANDAMENTO.podeIrPara(StatusTarefa.PENDENTE)).isTrue();
        assertThat(StatusTarefa.EM_ANDAMENTO.podeIrPara(StatusTarefa.CONCLUIDA)).isTrue();
        assertThat(StatusTarefa.CONCLUIDA.podeIrPara(StatusTarefa.EM_ANDAMENTO)).isTrue();
        assertThat(StatusTarefa.PENDENTE.podeIrPara(StatusTarefa.CONCLUIDA)).isFalse();
        assertThat(StatusTarefa.CONCLUIDA.podeIrPara(StatusTarefa.PENDENTE)).isFalse();
        assertThat(StatusTarefa.PENDENTE.podeIrPara(StatusTarefa.PENDENTE)).isFalse();
    }

    private org.springframework.test.web.servlet.ResultActions mudar(String token, long tarefa, String status)
            throws Exception {
        return enviar("PATCH", "/api/tarefas/" + tarefa + "/status", token, json("status", status));
    }
}
