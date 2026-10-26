package com.taskflow.erro;

import org.springframework.http.HttpStatus;

public enum CodigoErroApi {
    VALIDACAO("VALIDACAO", HttpStatus.BAD_REQUEST,
            "Dados inválidos", "Um ou mais campos são inválidos."),
    TRANSICAO_STATUS_INVALIDA("TRANSICAO_STATUS_INVALIDA", HttpStatus.BAD_REQUEST,
            "Transição de status inválida", "O status só pode mudar para um estágio vizinho."),
    DONO_NAO_PODE_SER_REMOVIDO("DONO_NAO_PODE_SER_REMOVIDO", HttpStatus.BAD_REQUEST,
            "Dono não pode ser removido", "O Dono da equipe não pode ser removido."),
    ROTA_NAO_ENCONTRADA("ROTA_NAO_ENCONTRADA", HttpStatus.NOT_FOUND,
            "Rota não encontrada", "A rota solicitada não existe."),
    METODO_NAO_PERMITIDO("METODO_NAO_PERMITIDO", HttpStatus.METHOD_NOT_ALLOWED,
            "Método não permitido", "O método HTTP não é permitido para esta rota."),
    TIPO_CONTEUDO_NAO_SUPORTADO("TIPO_CONTEUDO_NAO_SUPORTADO", HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            "Tipo de conteúdo não suportado", "Envie o corpo da requisição como application/json."),
    NAO_AUTENTICADO("NAO_AUTENTICADO", HttpStatus.UNAUTHORIZED,
            "Não autenticado", "Informe um token de acesso válido."),
    CREDENCIAIS_INVALIDAS("CREDENCIAIS_INVALIDAS", HttpStatus.UNAUTHORIZED,
            "Credenciais inválidas", "E-mail ou senha inválidos."),
    SEM_PERMISSAO("SEM_PERMISSAO", HttpStatus.FORBIDDEN,
            "Sem permissão", "Você não tem permissão para esta ação."),
    SEM_EQUIPE("SEM_EQUIPE", HttpStatus.FORBIDDEN,
            "Sem equipe", "Você não pertence a nenhuma equipe."),
    USUARIO_NAO_ENCONTRADO("USUARIO_NAO_ENCONTRADO", HttpStatus.NOT_FOUND,
            "Usuário não encontrado", "Usuário não encontrado."),
    TAREFA_NAO_ENCONTRADA("TAREFA_NAO_ENCONTRADA", HttpStatus.NOT_FOUND,
            "Tarefa não encontrada", "Tarefa não encontrada."),
    EMAIL_JA_CADASTRADO("EMAIL_JA_CADASTRADO", HttpStatus.CONFLICT,
            "E-mail já cadastrado", "Já existe uma conta com este e-mail."),
    USUARIO_JA_TEM_EQUIPE("USUARIO_JA_TEM_EQUIPE", HttpStatus.CONFLICT,
            "Usuário já tem equipe", "Este usuário já pertence a uma equipe."),
    ERRO_INTERNO("ERRO_INTERNO", HttpStatus.INTERNAL_SERVER_ERROR,
            "Erro interno", "Ocorreu um erro inesperado.");

    private final String codigo;
    private final HttpStatus status;
    private final String titulo;
    private final String detalhe;

    CodigoErroApi(String codigo, HttpStatus status, String titulo, String detalhe) {
        this.codigo = codigo;
        this.status = status;
        this.titulo = titulo;
        this.detalhe = detalhe;
    }

    public String codigo() {
        return codigo;
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
}
