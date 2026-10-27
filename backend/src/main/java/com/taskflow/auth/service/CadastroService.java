package com.taskflow.auth.service;

import com.taskflow.auth.dto.CadastroRequest;
import com.taskflow.auth.dto.SessaoResponse;
import com.taskflow.dominio.Equipe;
import com.taskflow.dominio.EquipeRepository;
import com.taskflow.dominio.LimitesCampos;
import com.taskflow.dominio.Papel;
import com.taskflow.dominio.Usuario;
import com.taskflow.dominio.UsuarioRepository;
import com.taskflow.erro.CampoApi;
import com.taskflow.erro.CodigoErroApi;
import com.taskflow.erro.ErroDeAplicacao;
import com.taskflow.erro.EventoLog;
import com.taskflow.erro.RegistroEventos;
import com.taskflow.validacao.Campos;
import com.taskflow.validacao.PoliticaSenha;
import java.time.Clock;
import java.time.Instant;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CadastroService {

    private static final String PREFIXO_NOME_EQUIPE = "Equipe de ";

    private final UsuarioRepository usuarioRepository;
    private final EquipeRepository equipeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final Clock clock;
    private final RegistroEventos registro;

    public CadastroService(
            UsuarioRepository usuarioRepository,
            EquipeRepository equipeRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            Clock clock,
            RegistroEventos registro) {
        this.usuarioRepository = usuarioRepository;
        this.equipeRepository = equipeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.clock = clock;
        this.registro = registro;
    }

    /**
     * Tipo {@code DONO}: cria usuário e equipe "Equipe de {nome}" (papel DONO) na mesma transação.
     * Tipo {@code MEMBRO}: cria só o usuário, sem equipe; um Dono o adiciona depois pelo e-mail.
     */
    @Transactional
    public SessaoResponse cadastrar(CadastroRequest cadastro) {
        String nome = Campos.textoObrigatorio(cadastro.nome(), CampoApi.NOME, LimitesCampos.NOME_USUARIO);
        String email = Campos.emailObrigatorio(cadastro.email(), CampoApi.EMAIL, LimitesCampos.EMAIL);
        PoliticaSenha.validar(cadastro.senha());
        Papel tipo = Campos.enumObrigatorio(cadastro.tipo(), Papel.class, CampoApi.TIPO);
        if (usuarioRepository.existsByEmail(email)) {
            throw new ErroDeAplicacao(CodigoErroApi.EMAIL_JA_CADASTRADO);
        }
        Instant agora = clock.instant();
        Usuario usuario = new Usuario(nome, email, passwordEncoder.encode(cadastro.senha()), agora);
        if (tipo == Papel.DONO) {
            Equipe equipe = equipeRepository.save(new Equipe(PREFIXO_NOME_EQUIPE + nome, agora));
            usuario.entrarNaEquipe(equipe, Papel.DONO);
        }
        try {
            usuarioRepository.saveAndFlush(usuario);
        } catch (DataIntegrityViolationException erro) {
            throw new ErroDeAplicacao(CodigoErroApi.EMAIL_JA_CADASTRADO, erro);
        }
        registro.registrar(EventoLog.CADASTRO_CONCLUIDO, usuario.getId(), tipo);
        return jwtService.emitir(usuario.getId());
    }
}
