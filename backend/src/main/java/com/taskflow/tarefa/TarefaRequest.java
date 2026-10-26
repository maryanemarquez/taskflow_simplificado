package com.taskflow.tarefa;

import java.time.LocalDate;

public record TarefaRequest(String titulo, String descricao, LocalDate prazo, Long responsavelId) {
}
