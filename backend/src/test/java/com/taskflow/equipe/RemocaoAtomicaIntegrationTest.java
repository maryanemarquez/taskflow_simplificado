package com.taskflow.equipe;

import com.taskflow.TesteIntegracaoBase;
import com.taskflow.dominio.TarefaRepository;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

class RemocaoAtomicaIntegrationTest extends TesteIntegracaoBase {

    @MockitoBean
    private TarefaRepository tarefaRepository;

    @Test
    @DisplayName("HIST-001-equipe/C07 - se a reatribuição falha, o membro continua na equipe")
    void falhaNaReatribuicaoDesfazARemocao() throws Exception {
        String dono = cadastrar("Dono", "dono.c07@taskflow.invalid");
        entrarNaEquipe(dono, "Bia", "bia.c07@taskflow.invalid");
        long idBia = idDoUsuario("bia.c07@taskflow.invalid");
        when(tarefaRepository.reatribuirResponsavel(eq(idBia), any())).thenThrow(new IllegalStateException("falha"));

        int resposta = enviar("DELETE", "/api/membros/" + idBia, dono, null)
                .andReturn().getResponse().getStatus();

        assertThat(resposta).isEqualTo(500);
        assertThat(jdbcTemplate.queryForObject(
                "SELECT papel FROM usuario WHERE id = ?", String.class, idBia)).isEqualTo("MEMBRO");
        assertThat(jdbcTemplate.queryForObject(
                "SELECT equipe_id FROM usuario WHERE id = ?", Long.class, idBia)).isNotNull();
    }
}
