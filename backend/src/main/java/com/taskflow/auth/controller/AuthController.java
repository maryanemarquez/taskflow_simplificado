package com.taskflow.auth.controller;

import com.taskflow.auth.dto.CadastroRequest;
import com.taskflow.auth.dto.LoginRequest;
import com.taskflow.auth.dto.MeResponse;
import com.taskflow.auth.dto.SessaoResponse;
import com.taskflow.auth.service.CadastroService;
import com.taskflow.auth.service.LoginService;
import com.taskflow.auth.service.PerfilService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final CadastroService cadastroService;
    private final LoginService loginService;
    private final PerfilService perfilService;

    public AuthController(
            CadastroService cadastroService,
            LoginService loginService,
            PerfilService perfilService) {
        this.cadastroService = cadastroService;
        this.loginService = loginService;
        this.perfilService = perfilService;
    }

    @PostMapping(RotasAuth.PREFIXO_AUTH + RotasAuth.ROTA_CADASTRO)
    public ResponseEntity<SessaoResponse> cadastrar(@RequestBody CadastroRequest cadastro) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cadastroService.cadastrar(cadastro));
    }

    @PostMapping(RotasAuth.PREFIXO_AUTH + RotasAuth.ROTA_LOGIN)
    public SessaoResponse entrar(@RequestBody LoginRequest login) {
        return loginService.entrar(login);
    }

    @GetMapping(RotasAuth.ROTA_ME)
    public MeResponse eu(@RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO_ID) Long usuarioId) {
        return perfilService.consultar(usuarioId);
    }
}
