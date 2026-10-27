package com.taskflow.equipe;

import com.taskflow.dominio.Papel;
import com.taskflow.dominio.Usuario;

public record MembroResponse(Long id, String nome, String email, Papel papel) {

    static MembroResponse de(Usuario usuario) {
        return new MembroResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPapel());
    }
}
