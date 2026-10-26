package com.taskflow.tarefa;

import com.taskflow.dominio.Campos;
import com.taskflow.dominio.StatusTarefa;
import com.taskflow.dominio.Tarefa;
import com.taskflow.dominio.TarefaRepository;
import com.taskflow.dominio.Usuario;
import com.taskflow.dominio.UsuarioRepository;
import com.taskflow.equipe.AcessoEquipe;
import com.taskflow.erro.CodigoErroApi;
import com.taskflow.erro.ErroDeAplicacao;
import com.taskflow.erro.ErroValidacao;
import java.time.Clock;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TarefaService {

    private static final int MAXIMO_TITULO = 150;
    private static final int MAXIMO_DESCRICAO = 2000;
    private static final String CAMPO_TITULO = "titulo";
    private static final String CAMPO_DESCRICAO = "descricao";
    private static final String CAMPO_RESPONSAVEL = "responsavelId";
    private static final String CAMPO_STATUS = "status";

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
        String titulo = Campos.textoObrigatorio(requisicao.titulo(), CAMPO_TITULO, MAXIMO_TITULO);
        String descricao = Campos.textoOpcional(requisicao.descricao(), CAMPO_DESCRICAO, MAXIMO_DESCRICAO);
        Usuario responsavel = usuario.ehDono() && requisicao.responsavelId() != null
                ? responsavelDaEquipe(usuario, requisicao.responsavelId())
                : usuario;
        Tarefa tarefa = new Tarefa(usuario.getEquipe(), usuario, clock.instant());
        tarefa.atualizar(titulo, descricao, requisicao.prazo());
        tarefa.atribuirA(responsavel);
        return TarefaResponse.de(tarefaRepository.save(tarefa));
    }

    @Transactional
    public TarefaResponse editar(long usuarioId, long tarefaId, TarefaRequest requisicao) {
        Usuario usuario = acesso.exigirComEquipe(usuarioId);
        Tarefa tarefa = buscarNaEquipe(usuario, tarefaId);
        exigirDonoOuResponsavel(usuario, tarefa);
        String titulo = Campos.textoObrigatorio(requisicao.titulo(), CAMPO_TITULO, MAXIMO_TITULO);
        String descricao = Campos.textoOpcional(requisicao.descricao(), CAMPO_DESCRICAO, MAXIMO_DESCRICAO);
        Long novoResponsavelId = requisicao.responsavelId();
        if (novoResponsavelId != null && !novoResponsavelId.equals(tarefa.getResponsavel().getId())) {
            if (!usuario.ehDono()) {
                throw new ErroDeAplicacao(CodigoErroApi.SEM_PERMISSAO);
            }
            tarefa.atribuirA(responsavelDaEquipe(usuario, novoResponsavelId));
        }
        tarefa.atualizar(titulo, descricao, requisicao.prazo());
        return TarefaResponse.de(tarefaRepository.save(tarefa));
    }

    @Transactional
    public TarefaResponse alterarStatus(long usuarioId, long tarefaId, String statusInformado) {
        Usuario usuario = acesso.exigirComEquipe(usuarioId);
        Tarefa tarefa = buscarNaEquipe(usuario, tarefaId);
        exigirDonoOuResponsavel(usuario, tarefa);
        StatusTarefa novoStatus = interpretarStatus(statusInformado);
        if (!tarefa.getStatus().podeIrPara(novoStatus)) {
            throw new ErroDeAplicacao(CodigoErroApi.TRANSICAO_STATUS_INVALIDA);
        }
        tarefa.mudarStatus(novoStatus);
        return TarefaResponse.de(tarefaRepository.save(tarefa));
    }

    @Transactional
    public void remover(long usuarioId, long tarefaId) {
        Usuario usuario = acesso.exigirComEquipe(usuarioId);
        Tarefa tarefa = buscarNaEquipe(usuario, tarefaId);
        if (!usuario.ehDono()) {
            throw new ErroDeAplicacao(CodigoErroApi.SEM_PERMISSAO);
        }
        tarefaRepository.delete(tarefa);
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
                .orElseThrow(() -> ErroValidacao.invalido(CAMPO_RESPONSAVEL));
    }

    private StatusTarefa interpretarStatus(String valor) {
        try {
            return StatusTarefa.valueOf(valor == null ? "" : valor.trim());
        } catch (IllegalArgumentException erro) {
            throw ErroValidacao.invalido(CAMPO_STATUS);
        }
    }
}
