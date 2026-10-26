package com.taskflow.tarefa;

import com.taskflow.auth.controller.AutenticacaoInterceptor;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
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
            @RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO_ID) Long usuarioId) {
        return tarefaService.listar(usuarioId);
    }

    @PostMapping
    public ResponseEntity<TarefaResponse> criar(
            @RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO_ID) Long usuarioId,
            @RequestBody TarefaRequest requisicao) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tarefaService.criar(usuarioId, requisicao));
    }

    @PutMapping("/{id}")
    public TarefaResponse editar(
            @RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO_ID) Long usuarioId,
            @PathVariable("id") Long tarefaId,
            @RequestBody TarefaRequest requisicao) {
        return tarefaService.editar(usuarioId, tarefaId, requisicao);
    }

    @PatchMapping("/{id}/status")
    public TarefaResponse alterarStatus(
            @RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO_ID) Long usuarioId,
            @PathVariable("id") Long tarefaId,
            @RequestBody StatusRequest requisicao) {
        return tarefaService.alterarStatus(usuarioId, tarefaId, requisicao.status());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(
            @RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO_ID) Long usuarioId,
            @PathVariable("id") Long tarefaId) {
        tarefaService.remover(usuarioId, tarefaId);
        return ResponseEntity.noContent().build();
    }
}
