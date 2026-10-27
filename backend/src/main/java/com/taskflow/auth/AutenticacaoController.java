package com.taskflow.auth;

import com.taskflow.configuracao.Rotas;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AutenticacaoController {

    private final CadastroService cadastroService;
    private final LoginService loginService;
    private final PerfilService perfilService;

    public AutenticacaoController(
            CadastroService cadastroService,
            LoginService loginService,
            PerfilService perfilService) {
        this.cadastroService = cadastroService;
        this.loginService = loginService;
        this.perfilService = perfilService;
    }

    @PostMapping(Rotas.PREFIXO_AUTH + Rotas.ROTA_CADASTRO)
    public ResponseEntity<SessaoResponse> cadastrar(@RequestBody CadastroRequest cadastro) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cadastroService.cadastrar(cadastro));
    }

    @PostMapping(Rotas.PREFIXO_AUTH + Rotas.ROTA_LOGIN)
    public SessaoResponse entrar(@RequestBody LoginRequest login) {
        return loginService.entrar(login);
    }

    @GetMapping(Rotas.ROTA_ME)
    public MeResponse consultarPerfil(@UsuarioAutenticado long usuarioId) {
        return perfilService.consultar(usuarioId);
    }
}
