package com.taskflow.dominio;

public enum StatusTarefa {
    PENDENTE,
    EM_ANDAMENTO,
    CONCLUIDA;

    /** Só é permitido mover para o estágio vizinho (avançando ou retrocedendo). */
    public boolean podeIrPara(StatusTarefa alvo) {
        return Math.abs(alvo.ordinal() - ordinal()) == 1;
    }
}
