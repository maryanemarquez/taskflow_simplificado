package com.taskflow.dashboard;

import com.taskflow.dominio.StatusTarefa;
import java.util.Map;

/** Contagens por status da equipe e do usuário autenticado. Os três status sempre estão presentes. */
public record DashboardResponse(Map<StatusTarefa, Long> equipe, Map<StatusTarefa, Long> minhasTarefas) {
}
