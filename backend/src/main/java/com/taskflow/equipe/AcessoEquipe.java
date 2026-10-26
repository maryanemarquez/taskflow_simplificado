package com.taskflow.equipe;

import com.taskflow.dominio.Usuario;
import com.taskflow.dominio.UsuarioRepository;
import com.taskflow.erro.CodigoErroApi;
import com.taskflow.erro.ErroDeAplicacao;
import org.springframework.stereotype.Component;

/** Regras de acesso comuns: usuário autenticado, com equipe e, quando preciso, Dono. */
@Component
public class AcessoEquipe {

    private final UsuarioRepository usuarioRepository;

    public AcessoEquipe(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario exigirComEquipe(long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ErroDeAplicacao(CodigoErroApi.NAO_AUTENTICADO));
        if (!usuario.temEquipe()) {
            throw new ErroDeAplicacao(CodigoErroApi.SEM_EQUIPE);
        }
        return usuario;
    }

    public Usuario exigirDono(long usuarioId) {
        Usuario usuario = exigirComEquipe(usuarioId);
        if (!usuario.ehDono()) {
            throw new ErroDeAplicacao(CodigoErroApi.SEM_PERMISSAO);
        }
        return usuario;
    }
}
