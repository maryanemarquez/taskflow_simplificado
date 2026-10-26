package com.taskflow.dominio;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    List<Tarefa> findByEquipeIdOrderByCriadoEmAscIdAsc(Long equipeId);

    Optional<Tarefa> findByIdAndEquipeId(Long id, Long equipeId);

    List<Tarefa> findByResponsavelId(Long responsavelId);

    /** Contagem de status. */
    interface ContagemStatus {

        StatusTarefa getStatus();

        long getTotal();
    }

    @Query("select t.status as status, count(t) as total from Tarefa t "
            + "where t.equipe.id = :equipeId group by t.status")
    List<ContagemStatus> contarPorStatusDaEquipe(@Param("equipeId") Long equipeId);

    @Query("select t.status as status, count(t) as total from Tarefa t "
            + "where t.equipe.id = :equipeId and t.responsavel.id = :responsavelId group by t.status")
    List<ContagemStatus> contarPorStatusDoResponsavel(
            @Param("equipeId") Long equipeId, @Param("responsavelId") Long responsavelId);
}
