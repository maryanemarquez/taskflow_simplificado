package com.taskflow.dashboard;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.taskflow.TesteIntegracaoBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.ResultActions;

class DashboardIntegrationTest extends TesteIntegracaoBase {

    private static final String ROTA = "/api/dashboard";

    @Test
    @DisplayName("HIST-001-dashboard/C01 - conta as tarefas da equipe por status")
    void contaAsTarefasDaEquipe() throws Exception {
        String dono = cadastrar("Dono", "dono.c01@taskflow.invalid");
        String membro = entrarNaEquipe(dono, "Bia", "bia.c01@taskflow.invalid");
        criarTarefa(dono, "A", null);
        criarTarefa(membro, "B", null);
        long andamento = criarTarefa(dono, "C", null);
        long concluida = criarTarefa(dono, "D", null);
        mudar(dono, andamento, "EM_ANDAMENTO");
        mudar(dono, concluida, "EM_ANDAMENTO");
        mudar(dono, concluida, "CONCLUIDA");

        consultar(dono).andExpect(status().isOk())
                .andExpect(jsonPath("$.equipe.PENDENTE").value(2))
                .andExpect(jsonPath("$.equipe.EM_ANDAMENTO").value(1))
                .andExpect(jsonPath("$.equipe.CONCLUIDA").value(1));
    }

    @Test
    @DisplayName("HIST-001-dashboard/C02 - minhasTarefas conta só as atribuídas ao usuário")
    void contaSoAsTarefasDoUsuario() throws Exception {
        String dono = cadastrar("Dono", "dono.c02@taskflow.invalid");
        String membro = entrarNaEquipe(dono, "Bia", "bia.c02@taskflow.invalid");
        long idBia = idDoUsuario("bia.c02@taskflow.invalid");
        criarTarefa(dono, "Do dono", null);
        criarTarefa(dono, "Da Bia, criada pelo dono", idBia);
        criarTarefa(membro, "Da Bia", null);

        consultar(membro).andExpect(status().isOk())
                .andExpect(jsonPath("$.minhasTarefas.PENDENTE").value(2))
                .andExpect(jsonPath("$.equipe.PENDENTE").value(3));
        consultar(dono)
                .andExpect(jsonPath("$.minhasTarefas.PENDENTE").value(1));
    }

    @Test
    @DisplayName("HIST-001-dashboard/C03 - devolve zero nos status sem tarefas")
    void devolveZeros() throws Exception {
        String dono = cadastrar("Dono", "dono.c03@taskflow.invalid");

        consultar(dono).andExpect(status().isOk())
                .andExpect(jsonPath("$.equipe.PENDENTE").value(0))
                .andExpect(jsonPath("$.equipe.EM_ANDAMENTO").value(0))
                .andExpect(jsonPath("$.equipe.CONCLUIDA").value(0))
                .andExpect(jsonPath("$.minhasTarefas.PENDENTE").value(0))
                .andExpect(jsonPath("$.minhasTarefas.EM_ANDAMENTO").value(0))
                .andExpect(jsonPath("$.minhasTarefas.CONCLUIDA").value(0));
    }

    @Test
    @DisplayName("HIST-001-dashboard/C04 - isola os dados por equipe")
    void isolaPorEquipe() throws Exception {
        String dono = cadastrar("Dono", "dono.c04@taskflow.invalid");
        String outro = cadastrar("Outro", "outro.c04@taskflow.invalid");
        criarTarefa(dono, "Minha", null);
        criarTarefa(outro, "Dele 1", null);
        criarTarefa(outro, "Dele 2", null);

        consultar(dono)
                .andExpect(jsonPath("$.equipe.PENDENTE").value(1))
                .andExpect(jsonPath("$.minhasTarefas.PENDENTE").value(1));
        consultar(outro)
                .andExpect(jsonPath("$.equipe.PENDENTE").value(2));
    }

    @Test
    @DisplayName("HIST-001-dashboard/C05 - reflete a mudança de status na próxima consulta")
    void refleteMudancaDeStatus() throws Exception {
        String dono = cadastrar("Dono", "dono.c05@taskflow.invalid");
        long tarefa = criarTarefa(dono, "Minha", null);
        consultar(dono).andExpect(jsonPath("$.minhasTarefas.PENDENTE").value(1));

        mudar(dono, tarefa, "EM_ANDAMENTO");

        consultar(dono)
                .andExpect(jsonPath("$.minhasTarefas.PENDENTE").value(0))
                .andExpect(jsonPath("$.minhasTarefas.EM_ANDAMENTO").value(1))
                .andExpect(jsonPath("$.equipe.EM_ANDAMENTO").value(1));
    }

    @Test
    @DisplayName("HIST-001-dashboard/C06 - usuário sem equipe recebe 403 SEM_EQUIPE")
    void semEquipe() throws Exception {
        String semEquipe = cadastrarMembro("Bia", "bia.c06@taskflow.invalid");

        consultar(semEquipe).andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("SEM_EQUIPE"));
    }

    @Test
    @DisplayName("HIST-001-dashboard/C07 - exige autenticação")
    void exigeAutenticacao() throws Exception {
        consultar(null).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NAO_AUTENTICADO"));
    }

    private ResultActions consultar(String token) throws Exception {
        return enviar("GET", ROTA, token, null);
    }

    private void mudar(String token, long tarefa, String status) throws Exception {
        enviar("PATCH", "/api/tarefas/" + tarefa + "/status", token, json("status", status));
    }
}
