package com.taskflow.auth.service;

import com.taskflow.auth.dto.LoginRequest;
import com.taskflow.auth.dto.SessaoResponse;
import com.taskflow.dominio.Usuario;
import com.taskflow.dominio.UsuarioRepository;
import com.taskflow.erro.CodigoErroApi;
import com.taskflow.erro.ErroDeAplicacao;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final String hashFalso;

    public LoginService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.hashFalso = passwordEncoder.encode("senha-inexistente-1");
    }

    /** E-mail inexistente e senha errada respondem igual, com custo de hash semelhante. */
    public SessaoResponse entrar(LoginRequest login) {
        if (login.email() == null || login.senha() == null) {
            throw new ErroDeAplicacao(CodigoErroApi.CREDENCIAIS_INVALIDAS);
        }
        String email = login.email().trim().toLowerCase(Locale.ROOT);
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        String hash = usuario == null ? hashFalso : usuario.getSenhaHash();
        boolean senhaConfere = passwordEncoder.matches(login.senha(), hash);
        if (usuario == null || !senhaConfere) {
            throw new ErroDeAplicacao(CodigoErroApi.CREDENCIAIS_INVALIDAS);
        }
        return jwtService.emitir(usuario.getId());
    }
}
