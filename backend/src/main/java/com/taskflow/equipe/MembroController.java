package com.taskflow.equipe;

import com.taskflow.auth.controller.AutenticacaoInterceptor;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/membros")
public class MembroController {

    private final MembroService membroService;

    public MembroController(MembroService membroService) {
        this.membroService = membroService;
    }

    @GetMapping
    public List<MembroResponse> listar(
            @RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO_ID) Long usuarioId) {
        return membroService.listar(usuarioId);
    }

    @PostMapping
    public ResponseEntity<MembroResponse> adicionar(
            @RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO_ID) Long usuarioId,
            @RequestBody AdicionarMembroRequest requisicao) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(membroService.adicionar(usuarioId, requisicao.email()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(
            @RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO_ID) Long usuarioId,
            @PathVariable("id") Long membroId) {
        membroService.remover(usuarioId, membroId);
        return ResponseEntity.noContent().build();
    }
}
