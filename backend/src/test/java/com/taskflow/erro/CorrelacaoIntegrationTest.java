package com.taskflow.erro;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

import com.taskflow.TesteIntegracaoBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CorrelacaoIntegrationTest extends TesteIntegracaoBase {

    private static final String ORIGEM_PADRAO = "http://localhost:8081";

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

    @Test
    @DisplayName("Correlação - CORS expõe X-Request-Id ao navegador em resposta de sucesso")
    void corsExpoeIdEmRespostaDeSucesso() throws Exception {
        String token = cadastrar("Ana", "cors.ok@taskflow.invalid");

        mockMvc.perform(get("/api/me")
                        .header("Authorization", "Bearer " + token)
                        .header("Origin", ORIGEM_PADRAO))
                .andExpect(header().string("Access-Control-Expose-Headers",
                        containsString(CorrelacaoFiltro.CABECALHO)));
    }

    @Test
    @DisplayName("Correlação - CORS expõe X-Request-Id também em resposta de erro")
    void corsExpoeIdEmRespostaDeErro() throws Exception {
        mockMvc.perform(get("/api/me").header("Origin", ORIGEM_PADRAO))
                .andExpect(header().string("Access-Control-Expose-Headers",
                        containsString(CorrelacaoFiltro.CABECALHO)));
    }
}
