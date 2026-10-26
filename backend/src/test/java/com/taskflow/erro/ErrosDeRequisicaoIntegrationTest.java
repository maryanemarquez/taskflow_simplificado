package com.taskflow.erro;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.taskflow.TesteIntegracaoBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

class ErrosDeRequisicaoIntegrationTest extends TesteIntegracaoBase {

    @Test
    @DisplayName("HIST-001-fundacao/C06 - rota inexistente responde 404 ROTA_NAO_ENCONTRADA")
    void rotaInexistenteResponde404() throws Exception {
        String token = cadastrar("Ana", "c06@taskflow.invalid");

        enviar("GET", "/api/nao-existe", token, null)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("ROTA_NAO_ENCONTRADA"));
        enviar("GET", "/fora-da-api", null, null)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("ROTA_NAO_ENCONTRADA"));
    }

    @Test
    @DisplayName("HIST-001-fundacao/C07 - método não permitido responde 405 METODO_NAO_PERMITIDO")
    void metodoNaoPermitidoResponde405() throws Exception {
        String token = cadastrar("Ana", "c07@taskflow.invalid");

        enviar("POST", "/api/me", token, "{}")
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.codigo").value("METODO_NAO_PERMITIDO"));
    }

    @Test
    @DisplayName("HIST-001-fundacao/C08 - corpo que não é JSON responde 415 TIPO_CONTEUDO_NAO_SUPORTADO")
    void tipoDeConteudoNaoSuportadoResponde415() throws Exception {
        String token = cadastrar("Ana", "c08@taskflow.invalid");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/tarefas")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("titulo=x"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.codigo").value("TIPO_CONTEUDO_NAO_SUPORTADO"));
    }

    @Test
    @DisplayName("HIST-001-fundacao/C09 - valor de campo com formato inválido indica o campo")
    void valorComFormatoInvalidoIndicaOCampo() throws Exception {
        String token = cadastrar("Ana", "c09@taskflow.invalid");

        enviar("POST", "/api/tarefas", token, "{\"titulo\":\"Teste\",\"prazo\":\"2026/11/30\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACAO"))
                .andExpect(jsonPath("$.erros[0].campo").value("prazo"))
                .andExpect(jsonPath("$.erros[0].codigo").value("INVALIDO"));
        enviar("POST", "/api/tarefas", token, "isto não é json")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACAO"))
                .andExpect(jsonPath("$.erros").doesNotExist());
    }
}
