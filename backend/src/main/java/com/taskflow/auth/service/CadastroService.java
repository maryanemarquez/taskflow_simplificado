package com.taskflow.auth.service;

import com.taskflow.auth.dto.CadastroRequest;
import com.taskflow.auth.dto.SessaoResponse;
import com.taskflow.dominio.Campos;
import com.taskflow.dominio.Equipe;
import com.taskflow.dominio.EquipeRepository;
import com.taskflow.dominio.Papel;
import com.taskflow.dominio.Usuario;
import com.taskflow.dominio.UsuarioRepository;
import com.taskflow.erro.CodigoErroApi;
import com.taskflow.erro.ErroDeAplicacao;
import com.taskflow.erro.ErroValidacao;
import com.taskflow.erro.MensagensApi;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CadastroService {

    private static final int MINIMO_CARACTERES_SENHA = 8;
    private static final int MAXIMO_BYTES_SENHA = 72;
    private static final int MAXIMO_CARACTERES_NOME = 100;
    private static final int MAXIMO_CARACTERES_EMAIL = 150;
    private static final String PADRAO_LETRA = ".*\\p{L}.*";
    private static final String PADRAO_NUMERO = ".*\\d.*";

    private final UsuarioRepository usuarioRepository;
    private final EquipeRepository equipeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final Clock clock;

    public CadastroService(
            UsuarioRepository usuarioRepository,
            EquipeRepository equipeRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            Clock clock) {
        this.usuarioRepository = usuarioRepository;
        this.equipeRepository = equipeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.clock = clock;
    }

    /**
     * Tipo {@code DONO}: cria usuário e equipe "Equipe de {nome}" (papel DONO) na mesma transação.
     * Tipo {@code MEMBRO}: cria só o usuário, sem equipe; um Dono o adiciona depois pelo e-mail.
     */
    @Transactional
    public SessaoResponse cadastrar(CadastroRequest cadastro) {
        String nome = Campos.textoObrigatorio(cadastro.nome(), MensagensApi.CAMPO_NOME, MAXIMO_CARACTERES_NOME);
        String email = Campos.emailObrigatorio(cadastro.email(), MensagensApi.CAMPO_EMAIL, MAXIMO_CARACTERES_EMAIL)
                .toLowerCase(Locale.ROOT);
        validarSenha(cadastro.senha());
        Papel tipo = interpretarTipo(cadastro.tipo());
        if (usuarioRepository.existsByEmail(email)) {
            throw new ErroDeAplicacao(CodigoErroApi.EMAIL_JA_CADASTRADO);
        }
        Instant agora = clock.instant();
        Usuario usuario = new Usuario(nome, email, passwordEncoder.encode(cadastro.senha()), agora);
        if (tipo == Papel.DONO) {
            Equipe equipe = equipeRepository.save(new Equipe("Equipe de " + nome, agora));
            usuario.entrarNaEquipe(equipe, Papel.DONO);
        }
        try {
            usuarioRepository.saveAndFlush(usuario);
        } catch (DataIntegrityViolationException erro) {
            throw new ErroDeAplicacao(CodigoErroApi.EMAIL_JA_CADASTRADO, erro);
        }
        return jwtService.emitir(usuario.getId());
    }

    private Papel interpretarTipo(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            throw ErroValidacao.obrigatorio(MensagensApi.CAMPO_TIPO);
        }
        try {
            return Papel.valueOf(tipo.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException erro) {
            throw ErroValidacao.invalido(MensagensApi.CAMPO_TIPO);
        }
    }

    private void validarSenha(String senha) {
        if (senha == null || senha.isEmpty()) {
            throw ErroValidacao.obrigatorio(MensagensApi.CAMPO_SENHA);
        }
        if (senha.getBytes(StandardCharsets.UTF_8).length > MAXIMO_BYTES_SENHA) {
            throw ErroValidacao.tamanhoExcedido(MensagensApi.CAMPO_SENHA);
        }
        if (senha.codePointCount(0, senha.length()) < MINIMO_CARACTERES_SENHA
                || !senha.matches(PADRAO_LETRA)
                || !senha.matches(PADRAO_NUMERO)) {
            throw ErroValidacao.senhaForaDaPolitica();
        }
    }
}
