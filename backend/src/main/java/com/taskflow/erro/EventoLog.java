package com.taskflow.erro;

import java.util.Optional;
import org.slf4j.event.Level;

/** Catálogo de eventos registrados em log. Os modelos nunca recebem e-mail nem senha, só ids. */
public enum EventoLog {
    REQUISICAO_NAO_AUTENTICADA(Level.WARN, "Requisição não autenticada: {} {} [{}]"),
    LOGIN_FALHOU(Level.WARN, "Falha de login: {} {} [{}]"),
    ACESSO_NEGADO(Level.WARN, "Acesso negado: {} {} [{}]"),
    CADASTRO_CONCLUIDO(Level.INFO, "Cadastro concluído: usuarioId={} tipo={}"),
    MEMBRO_ADICIONADO(Level.INFO, "Membro adicionado: donoId={} membroId={}"),
    MEMBRO_REMOVIDO(Level.INFO, "Membro removido: donoId={} membroId={}"),
    FALHA_INTERNA(Level.ERROR, "Falha interna em {} {}");

    private final Level nivel;
    private final String modelo;

    EventoLog(Level nivel, String modelo) {
        this.nivel = nivel;
        this.modelo = modelo;
    }

    public Level nivel() {
        return nivel;
    }

    public String modelo() {
        return modelo;
    }

    /** Evento de segurança correspondente ao erro, quando houver. */
    public static Optional<EventoLog> deSeguranca(CodigoErroApi erro) {
        return switch (erro) {
            case NAO_AUTENTICADO -> Optional.of(REQUISICAO_NAO_AUTENTICADA);
            case CREDENCIAIS_INVALIDAS -> Optional.of(LOGIN_FALHOU);
            case SEM_PERMISSAO, SEM_EQUIPE -> Optional.of(ACESSO_NEGADO);
            default -> Optional.empty();
        };
    }
}
