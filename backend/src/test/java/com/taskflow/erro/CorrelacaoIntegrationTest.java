package com.taskflow.erro;

import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

import com.taskflow.TesteIntegracaoBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CorrelacaoIntegrationTest extends TesteIntegracaoBase {

    @Test
    @DisplayName("Correlação - X-Request-Id válido é devolvido na resposta")
    void idValidoEhPropagado() throws Exception {
        mockMvc.perform(get("/fora-da-api").header(CorrelacaoFiltro.CABECALHO, "req-123"))
                .andExpect(header().string(CorrelacaoFiltro.CABECALHO, "req-123"));
    }

    @Test
    @DisplayName("Correlação - sem cabeçalho ou com valor inválido gera um novo id")
    void idAusenteOuInvalidoGeraNovoId() throws Exception {
        mockMvc.perform(get("/fora-da-api"))
                .andExpect(header().exists(CorrelacaoFiltro.CABECALHO));
        mockMvc.perform(get("/fora-da-api").header(CorrelacaoFiltro.CABECALHO, "ruim id\t!"))
                .andExpect(header().string(CorrelacaoFiltro.CABECALHO, not("ruim id\t!")));
    }
}
