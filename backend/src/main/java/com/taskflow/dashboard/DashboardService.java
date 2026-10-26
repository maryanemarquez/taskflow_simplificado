package com.taskflow.dashboard;

import com.taskflow.dominio.StatusTarefa;
import com.taskflow.dominio.TarefaRepository;
import com.taskflow.dominio.TarefaRepository.ContagemStatus;
import com.taskflow.dominio.Usuario;
import com.taskflow.equipe.AcessoEquipe;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final AcessoEquipe acesso;
    private final TarefaRepository tarefaRepository;

    public DashboardService(AcessoEquipe acesso, TarefaRepository tarefaRepository) {
        this.acesso = acesso;
        this.tarefaRepository = tarefaRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse consultar(long usuarioId) {
        Usuario usuario = acesso.exigirComEquipe(usuarioId);
        Long equipeId = usuario.getEquipe().getId();
        return new DashboardResponse(
                completar(tarefaRepository.contarPorStatusDaEquipe(equipeId)),
                completar(tarefaRepository.contarPorStatusDoResponsavel(equipeId, usuario.getId())));
    }

    /** Garante os três status na resposta, com zero onde não há tarefas. */
    private static Map<StatusTarefa, Long> completar(List<ContagemStatus> contagens) {
        Map<StatusTarefa, Long> resultado = new EnumMap<>(StatusTarefa.class);
        for (StatusTarefa status : StatusTarefa.values()) {
            resultado.put(status, 0L);
        }
        contagens.forEach(contagem -> resultado.put(contagem.getStatus(), contagem.getTotal()));
        return resultado;
    }
}
