package com.taskflow.equipe;

import com.taskflow.auth.UsuarioAutenticado;
import com.taskflow.configuracao.Rotas;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(Rotas.MEMBROS)
public class MembroController {

    private final MembroService membroService;

    public MembroController(MembroService membroService) {
        this.membroService = membroService;
    }

    @GetMapping
    public List<MembroResponse> listar(
            @UsuarioAutenticado long usuarioId) {
        return membroService.listar(usuarioId);
    }

    @PostMapping
    public ResponseEntity<MembroResponse> adicionar(
            @UsuarioAutenticado long usuarioId,
            @RequestBody AdicionarMembroRequest requisicao) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(membroService.adicionar(usuarioId, requisicao.email()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(
            @UsuarioAutenticado long usuarioId,
            @PathVariable("id") Long membroId) {
        membroService.remover(usuarioId, membroId);
        return ResponseEntity.noContent().build();
    }
}
