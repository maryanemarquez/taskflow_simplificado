package com.taskflow.dominio;

public enum StatusTarefa {
    PENDENTE,
    EM_ANDAMENTO,
    CONCLUIDA;

    /** Só é permitido mover para o estágio vizinho (avançando ou retrocedendo). */
    public boolean podeIrPara(StatusTarefa alvo) {
        return switch (this) {
            case PENDENTE -> alvo == EM_ANDAMENTO;
            case EM_ANDAMENTO -> alvo == PENDENTE || alvo == CONCLUIDA;
            case CONCLUIDA -> alvo == EM_ANDAMENTO;
        };
    }
}
