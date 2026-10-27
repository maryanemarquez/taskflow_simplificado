package com.taskflow.auth;

import com.taskflow.dominio.Usuario;
import com.taskflow.equipe.AcessoEquipe;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PerfilService {

    private final AcessoEquipe acesso;

    public PerfilService(AcessoEquipe acesso) {
        this.acesso = acesso;
    }

    @Transactional(readOnly = true)
    public MeResponse consultar(long usuarioId) {
        Usuario usuario = acesso.exigirUsuario(usuarioId);
        MeResponse.EquipeDto equipe = usuario.temEquipe()
                ? new MeResponse.EquipeDto(
                        usuario.getEquipe().getId(), usuario.getEquipe().getNome(), usuario.getPapel())
                : null;
        return new MeResponse(
                new MeResponse.UsuarioDto(usuario.getId(), usuario.getNome(), usuario.getEmail()), equipe);
    }
}
