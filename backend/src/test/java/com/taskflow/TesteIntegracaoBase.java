package com.taskflow;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** Base dos testes de integração: sobe a aplicação com H2 e limpa o banco a cada teste. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class TesteIntegracaoBase {

    protected static final String SENHA_PADRAO = "senha1234";
    private static final Pattern TOKEN = Pattern.compile("\"accessToken\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern ID = Pattern.compile("\"id\"\\s*:\\s*(\\d+)");

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected JdbcTemplate jdbcTemplate;

    @BeforeEach
    void limparBanco() {
        jdbcTemplate.update("DELETE FROM tarefa");
        jdbcTemplate.update("DELETE FROM usuario");
        jdbcTemplate.update("DELETE FROM equipe");
    }

    protected ResultActions enviar(String metodo, String url, String token, String json) throws Exception {
        MockHttpServletRequestBuilder requisicao = switch (metodo) {
            case "GET" -> get(url);
            case "POST" -> post(url);
            case "PUT" -> put(url);
            case "PATCH" -> patch(url);
            case "DELETE" -> delete(url);
            default -> throw new IllegalArgumentException(metodo);
        };
        if (token != null) {
            requisicao.header("Authorization", "Bearer " + token);
        }
        if (json != null) {
            requisicao.contentType(MediaType.APPLICATION_JSON).content(json);
        }
        return mockMvc.perform(requisicao);
    }

    /** Cadastra um Dono (cria a própria equipe) e devolve o token de acesso. */
    protected String cadastrar(String nome, String email) throws Exception {
        return cadastrarComTipo(nome, email, "DONO");
    }

    /** Cadastra um Membro (conta sem equipe) e devolve o token de acesso. */
    protected String cadastrarMembro(String nome, String email) throws Exception {
        return cadastrarComTipo(nome, email, "MEMBRO");
    }

    private String cadastrarComTipo(String nome, String email, String tipo) throws Exception {
        String resposta = enviar("POST", "/api/auth/cadastro", null, json(
                "nome", nome, "email", email, "senha", SENHA_PADRAO, "tipo", tipo))
                .andReturn().getResponse().getContentAsString();
        return extrairToken(resposta);
    }

    protected String login(String email) throws Exception {
        String resposta = enviar("POST", "/api/auth/login", null, json(
                "email", email, "senha", SENHA_PADRAO))
                .andReturn().getResponse().getContentAsString();
        return extrairToken(resposta);
    }

    /** Cria uma tarefa pela API e devolve o id. O responsável é opcional. */
    protected long criarTarefa(String token, String titulo, Long responsavelId) throws Exception {
        String corpo = "{\"titulo\":\"" + titulo + "\""
                + (responsavelId == null ? "" : ",\"responsavelId\":" + responsavelId) + "}";
        String resposta = enviar("POST", "/api/tarefas", token, corpo)
                .andReturn().getResponse().getContentAsString();
        return extrairId(resposta);
    }

    /** Cadastra um Membro e o adiciona à equipe do Dono pelo e-mail, como no uso real. */
    protected String entrarNaEquipe(String tokenDono, String nome, String email) throws Exception {
        String token = cadastrarMembro(nome, email);
        enviar("POST", "/api/membros", tokenDono, json("email", email));
        return token;
    }

    protected long idDoUsuario(String email) {
        return jdbcTemplate.queryForObject("SELECT id FROM usuario WHERE email = ?", Long.class, email);
    }

    protected static String extrairToken(String json) {
        Matcher encontrado = TOKEN.matcher(json);
        if (!encontrado.find()) {
            throw new IllegalStateException("Resposta sem token: " + json);
        }
        return encontrado.group(1);
    }

    protected static long extrairId(String json) {
        Matcher encontrado = ID.matcher(json);
        if (!encontrado.find()) {
            throw new IllegalStateException("Resposta sem id: " + json);
        }
        return Long.parseLong(encontrado.group(1));
    }

    /** Monta um JSON simples a partir de pares chave/valor de texto. */
    protected static String json(String... paresChaveValor) {
        StringBuilder corpo = new StringBuilder("{");
        for (int i = 0; i < paresChaveValor.length; i += 2) {
            if (i > 0) {
                corpo.append(',');
            }
            corpo.append('"').append(paresChaveValor[i]).append("\":");
            String valor = paresChaveValor[i + 1];
            corpo.append(valor == null ? "null" : "\"" + valor.replace("\"", "\\\"") + "\"");
        }
        return corpo.append('}').toString();
    }
}
