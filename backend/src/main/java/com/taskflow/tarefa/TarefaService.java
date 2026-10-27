package com.taskflow.tarefa;

import com.taskflow.dominio.DadosTarefa;
import com.taskflow.dominio.LimitesCampos;
import com.taskflow.dominio.StatusTarefa;
import com.taskflow.dominio.Tarefa;
import com.taskflow.dominio.TarefaRepository;
import com.taskflow.dominio.Usuario;
import com.taskflow.dominio.UsuarioRepository;
import com.taskflow.equipe.AcessoEquipe;
import com.taskflow.erro.CampoApi;
import com.taskflow.erro.CodigoErroApi;
import com.taskflow.erro.ErroDeAplicacao;
import com.taskflow.validacao.Campos;
import java.time.Clock;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TarefaService {

    private final AcessoEquipe acesso;
    private final TarefaRepository tarefaRepository;
    private final UsuarioRepository usuarioRepository;
    private final Clock clock;

    public TarefaService(
            AcessoEquipe acesso,
            TarefaRepository tarefaRepository,
            UsuarioRepository usuarioRepository,
            Clock clock) {
        this.acesso = acesso;
        this.tarefaRepository = tarefaRepository;
        this.usuarioRepository = usuarioRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<TarefaResponse> listar(long usuarioId) {
        Usuario usuario = acesso.exigirComEquipe(usuarioId);
        return tarefaRepository.findByEquipeIdOrderByCriadoEmAscIdAsc(usuario.getEquipe().getId()).stream()
                .map(TarefaResponse::de)
                .toList();
    }

    /** Membro sempre fica como responsável; o Dono escolhe qualquer usuário da equipe. */
    @Transactional
    public TarefaResponse criar(long usuarioId, TarefaRequest requisicao) {
        Usuario usuario = acesso.exigirComEquipe(usuarioId);
        DadosTarefa dados = validarDados(requisicao);
        Usuario responsavel = usuario.ehDono() && requisicao.responsavelId() != null
                ? responsavelDaEquipe(usuario, requisicao.responsavelId())
                : usuario;
        return TarefaResponse.de(tarefaRepository.save(new Tarefa(usuario, responsavel, dados, clock.instant())));
    }

    @Transactional
    public TarefaResponse editar(long usuarioId, long tarefaId, TarefaRequest requisicao) {
        Usuario usuario = acesso.exigirComEquipe(usuarioId);
        Tarefa tarefa = buscarNaEquipe(usuario, tarefaId);
        exigirDonoOuResponsavel(usuario, tarefa);
        DadosTarefa dados = validarDados(requisicao);
        Long novoResponsavelId = requisicao.responsavelId();
        if (novoResponsavelId != null && !novoResponsavelId.equals(tarefa.getResponsavel().getId())) {
            acesso.exigirDono(usuario);
            tarefa.atribuirA(responsavelDaEquipe(usuario, novoResponsavelId));
        }
        tarefa.atualizar(dados);
        return TarefaResponse.de(tarefa);
    }

    @Transactional
    public TarefaResponse alterarStatus(long usuarioId, long tarefaId, String statusInformado) {
        Usuario usuario = acesso.exigirComEquipe(usuarioId);
        Tarefa tarefa = buscarNaEquipe(usuario, tarefaId);
        exigirDonoOuResponsavel(usuario, tarefa);
        StatusTarefa novoStatus = Campos.enumObrigatorio(statusInformado, StatusTarefa.class, CampoApi.STATUS);
        if (!tarefa.getStatus().podeIrPara(novoStatus)) {
            throw new ErroDeAplicacao(CodigoErroApi.TRANSICAO_STATUS_INVALIDA);
        }
        tarefa.mudarStatus(novoStatus);
        return TarefaResponse.de(tarefa);
    }

    @Transactional
    public void remover(long usuarioId, long tarefaId) {
        Usuario usuario = acesso.exigirComEquipe(usuarioId);
        Tarefa tarefa = buscarNaEquipe(usuario, tarefaId);
        acesso.exigirDono(usuario);
        tarefaRepository.delete(tarefa);
    }

    private DadosTarefa validarDados(TarefaRequest requisicao) {
        return new DadosTarefa(
                Campos.textoObrigatorio(requisicao.titulo(), CampoApi.TITULO, LimitesCampos.TITULO_TAREFA),
                Campos.textoOpcional(requisicao.descricao(), CampoApi.DESCRICAO, LimitesCampos.DESCRICAO_TAREFA),
                requisicao.prazo());
    }

    private Tarefa buscarNaEquipe(Usuario usuario, long tarefaId) {
        return tarefaRepository.findByIdAndEquipeId(tarefaId, usuario.getEquipe().getId())
                .orElseThrow(() -> new ErroDeAplicacao(CodigoErroApi.TAREFA_NAO_ENCONTRADA));
    }

    private void exigirDonoOuResponsavel(Usuario usuario, Tarefa tarefa) {
        boolean responsavel = tarefa.getResponsavel().getId().equals(usuario.getId());
        if (!usuario.ehDono() && !responsavel) {
            throw new ErroDeAplicacao(CodigoErroApi.SEM_PERMISSAO);
        }
    }

    private Usuario responsavelDaEquipe(Usuario usuario, Long responsavelId) {
        return usuarioRepository.findByIdAndEquipeId(responsavelId, usuario.getEquipe().getId())
                .orElseThrow(() -> ErroDeAplicacao.invalido(CampoApi.RESPONSAVEL_ID));
    }
}
