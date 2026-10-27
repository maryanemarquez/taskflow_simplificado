package com.taskflow.tarefa;

import com.taskflow.dominio.StatusTarefa;
import com.taskflow.dominio.Tarefa;
import java.time.LocalDate;

public record TarefaResponse(
        Long id,
        String titulo,
        String descricao,
        StatusTarefa status,
        LocalDate prazo,
        Responsavel responsavel) {

    public record Responsavel(Long id, String nome) {
    }

    static TarefaResponse de(Tarefa tarefa) {
        return new TarefaResponse(
                tarefa.getId(),
                tarefa.getTitulo(),
                tarefa.getDescricao(),
                tarefa.getStatus(),
                tarefa.getPrazo(),
                new Responsavel(tarefa.getResponsavel().getId(), tarefa.getResponsavel().getNome()));
    }
}
