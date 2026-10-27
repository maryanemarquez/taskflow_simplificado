package com.taskflow.dominio;

import java.time.LocalDate;

/** Dados editáveis de uma tarefa, já validados. */
public record DadosTarefa(String titulo, String descricao, LocalDate prazo) {
}
