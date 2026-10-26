package com.taskflow.auth.dto;

public record MeResponse(UsuarioDto usuario, EquipeDto equipe) {

    public record UsuarioDto(Long id, String nome, String email) {
    }

    public record EquipeDto(Long id, String nome, String papel) {
    }
}
