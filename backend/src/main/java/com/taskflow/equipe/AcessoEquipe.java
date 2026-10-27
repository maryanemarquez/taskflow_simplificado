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

    /** Usuário do token; se ele não existe mais, a requisição não está autenticada. */
    public Usuario exigirUsuario(long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ErroDeAplicacao(CodigoErroApi.NAO_AUTENTICADO));
    }

    public Usuario exigirComEquipe(long usuarioId) {
        Usuario usuario = exigirUsuario(usuarioId);
        if (!usuario.temEquipe()) {
            throw new ErroDeAplicacao(CodigoErroApi.SEM_EQUIPE);
        }
        return usuario;
    }

    public Usuario exigirDono(long usuarioId) {
        Usuario usuario = exigirComEquipe(usuarioId);
        exigirDono(usuario);
        return usuario;
    }

    public void exigirDono(Usuario usuario) {
        if (!usuario.ehDono()) {
            throw new ErroDeAplicacao(CodigoErroApi.SEM_PERMISSAO);
        }
    }
}
