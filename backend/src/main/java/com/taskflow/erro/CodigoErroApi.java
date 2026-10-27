package com.taskflow.erro;

import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;

/** Erros da API. O código enviado ao cliente é o próprio {@code name()}. */
public enum CodigoErroApi {
    VALIDACAO(HttpStatus.BAD_REQUEST,
            "Dados inválidos", "Um ou mais campos são inválidos."),
    TRANSICAO_STATUS_INVALIDA(HttpStatus.BAD_REQUEST,
            "Transição de status inválida", "O status só pode mudar para um estágio vizinho."),
    DONO_NAO_PODE_SER_REMOVIDO(HttpStatus.BAD_REQUEST,
            "Dono não pode ser removido", "O Dono da equipe não pode ser removido."),
    ROTA_NAO_ENCONTRADA(HttpStatus.NOT_FOUND,
            "Rota não encontrada", "A rota solicitada não existe."),
    METODO_NAO_PERMITIDO(HttpStatus.METHOD_NOT_ALLOWED,
            "Método não permitido", "O método HTTP não é permitido para esta rota."),
    TIPO_CONTEUDO_NAO_SUPORTADO(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            "Tipo de conteúdo não suportado", "Envie o corpo da requisição como application/json."),
    NAO_AUTENTICADO(HttpStatus.UNAUTHORIZED,
            "Não autenticado", "Informe um token de acesso válido."),
    CREDENCIAIS_INVALIDAS(HttpStatus.UNAUTHORIZED,
            "Credenciais inválidas", "E-mail ou senha inválidos."),
    SEM_PERMISSAO(HttpStatus.FORBIDDEN,
            "Sem permissão", "Você não tem permissão para esta ação."),
    SEM_EQUIPE(HttpStatus.FORBIDDEN,
            "Sem equipe", "Você não pertence a nenhuma equipe."),
    USUARIO_NAO_ENCONTRADO(HttpStatus.NOT_FOUND,
            "Usuário não encontrado", "Usuário não encontrado."),
    TAREFA_NAO_ENCONTRADA(HttpStatus.NOT_FOUND,
            "Tarefa não encontrada", "Tarefa não encontrada."),
    EMAIL_JA_CADASTRADO(HttpStatus.CONFLICT,
            "E-mail já cadastrado", "Já existe uma conta com este e-mail."),
    USUARIO_JA_TEM_EQUIPE(HttpStatus.CONFLICT,
            "Usuário já tem equipe", "Este usuário já pertence a uma equipe."),
    CONFLITO_CONCORRENCIA(HttpStatus.CONFLICT,
            "Conflito de edição", "O recurso foi alterado por outra requisição. Tente novamente."),
    ERRO_INTERNO(HttpStatus.INTERNAL_SERVER_ERROR,
            "Erro interno", "Ocorreu um erro inesperado.");

    /** Erros que o próprio Spring MVC sinaliza (rota, método, tipo de conteúdo e requisição inválida). */
    private static final Map<Integer, CodigoErroApi> ERROS_DO_MVC = Map.of(
            ROTA_NAO_ENCONTRADA.status.value(), ROTA_NAO_ENCONTRADA,
            METODO_NAO_PERMITIDO.status.value(), METODO_NAO_PERMITIDO,
            TIPO_CONTEUDO_NAO_SUPORTADO.status.value(), TIPO_CONTEUDO_NAO_SUPORTADO,
            VALIDACAO.status.value(), VALIDACAO);

    private final HttpStatus status;
    private final String titulo;
    private final String detalhe;

    CodigoErroApi(HttpStatus status, String titulo, String detalhe) {
        this.status = status;
        this.titulo = titulo;
        this.detalhe = detalhe;
    }

    public HttpStatus status() {
        return status;
    }

    public String titulo() {
        return titulo;
    }

    public String detalhe() {
        return detalhe;
    }

    public static Optional<CodigoErroApi> deRequisicaoMvc(int statusHttp) {
        return Optional.ofNullable(ERROS_DO_MVC.get(statusHttp));
    }
}
