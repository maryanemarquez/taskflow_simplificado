package com.taskflow.auth.service;

import com.taskflow.auth.dto.MeResponse;
import com.taskflow.dominio.Usuario;
import com.taskflow.dominio.UsuarioRepository;
import com.taskflow.erro.CodigoErroApi;
import com.taskflow.erro.ErroDeAplicacao;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PerfilService {

    private final UsuarioRepository usuarioRepository;

    public PerfilService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public MeResponse consultar(long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ErroDeAplicacao(CodigoErroApi.NAO_AUTENTICADO));
        MeResponse.EquipeDto equipe = usuario.temEquipe()
                ? new MeResponse.EquipeDto(
                        usuario.getEquipe().getId(), usuario.getEquipe().getNome(), usuario.getPapel().name())
                : null;
        return new MeResponse(
                new MeResponse.UsuarioDto(usuario.getId(), usuario.getNome(), usuario.getEmail()), equipe);
    }
}
