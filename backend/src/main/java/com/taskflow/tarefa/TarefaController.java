package com.taskflow.tarefa;

import com.taskflow.auth.controller.UsuarioAutenticado;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    private final TarefaService tarefaService;

    public TarefaController(TarefaService tarefaService) {
        this.tarefaService = tarefaService;
    }

    @GetMapping
    public List<TarefaResponse> listar(
            @UsuarioAutenticado long usuarioId) {
        return tarefaService.listar(usuarioId);
    }

    @PostMapping
    public ResponseEntity<TarefaResponse> criar(
            @UsuarioAutenticado long usuarioId,
            @RequestBody TarefaRequest requisicao) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tarefaService.criar(usuarioId, requisicao));
    }

    @PutMapping("/{id}")
    public TarefaResponse editar(
            @UsuarioAutenticado long usuarioId,
            @PathVariable("id") Long tarefaId,
            @RequestBody TarefaRequest requisicao) {
        return tarefaService.editar(usuarioId, tarefaId, requisicao);
    }

    @PatchMapping("/{id}/status")
    public TarefaResponse alterarStatus(
            @UsuarioAutenticado long usuarioId,
            @PathVariable("id") Long tarefaId,
            @RequestBody StatusRequest requisicao) {
        return tarefaService.alterarStatus(usuarioId, tarefaId, requisicao.status());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(
            @UsuarioAutenticado long usuarioId,
            @PathVariable("id") Long tarefaId) {
        tarefaService.remover(usuarioId, tarefaId);
        return ResponseEntity.noContent().build();
    }
}
