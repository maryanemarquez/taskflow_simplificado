package com.taskflow.equipe;

import com.taskflow.dominio.LimitesCampos;
import com.taskflow.dominio.Papel;
import com.taskflow.dominio.TarefaRepository;
import com.taskflow.dominio.Usuario;
import com.taskflow.dominio.UsuarioRepository;
import com.taskflow.erro.CampoApi;
import com.taskflow.erro.CodigoErroApi;
import com.taskflow.erro.ErroDeAplicacao;
import com.taskflow.erro.EventoLog;
import com.taskflow.erro.RegistroEventos;
import com.taskflow.validacao.Campos;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MembroService {

    private final AcessoEquipe acesso;
    private final UsuarioRepository usuarioRepository;
    private final TarefaRepository tarefaRepository;
    private final RegistroEventos registro;

    public MembroService(
            AcessoEquipe acesso,
            UsuarioRepository usuarioRepository,
            TarefaRepository tarefaRepository,
            RegistroEventos registro) {
        this.acesso = acesso;
        this.usuarioRepository = usuarioRepository;
        this.tarefaRepository = tarefaRepository;
        this.registro = registro;
    }

    @Transactional(readOnly = true)
    public List<MembroResponse> listar(long usuarioId) {
        Usuario usuario = acesso.exigirComEquipe(usuarioId);
        return usuarioRepository.findByEquipeIdOrderByNomeAsc(usuario.getEquipe().getId()).stream()
                .map(MembroResponse::de)
                .toList();
    }

    /** Adiciona como MEMBRO uma conta existente que ainda não tem equipe. */
    @Transactional
    public MembroResponse adicionar(long donoId, String emailInformado) {
        Usuario dono = acesso.exigirDono(donoId);
        String email = Campos.emailObrigatorio(emailInformado, CampoApi.EMAIL, LimitesCampos.EMAIL);
        Usuario alvo = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ErroDeAplicacao(CodigoErroApi.USUARIO_NAO_ENCONTRADO));
        if (alvo.temEquipe()) {
            throw new ErroDeAplicacao(CodigoErroApi.USUARIO_JA_TEM_EQUIPE);
        }
        alvo.entrarNaEquipe(dono.getEquipe(), Papel.MEMBRO);
        registro.registrar(EventoLog.MEMBRO_ADICIONADO, dono.getId(), alvo.getId());
        return MembroResponse.de(alvo);
    }

    /**
     * Remove o membro da equipe e passa suas tarefas ao Dono, tudo na mesma transação:
     * qualquer falha desfaz a remoção.
     */
    @Transactional
    public void remover(long donoId, long membroId) {
        Usuario dono = acesso.exigirDono(donoId);
        Usuario alvo = usuarioRepository.findByIdAndEquipeId(membroId, dono.getEquipe().getId())
                .orElseThrow(() -> new ErroDeAplicacao(CodigoErroApi.USUARIO_NAO_ENCONTRADO));
        if (alvo.ehDono()) {
            throw new ErroDeAplicacao(CodigoErroApi.DONO_NAO_PODE_SER_REMOVIDO);
        }
        alvo.sairDaEquipe();
        tarefaRepository.reatribuirResponsavel(alvo.getId(), dono);
        registro.registrar(EventoLog.MEMBRO_REMOVIDO, dono.getId(), alvo.getId());
    }
}
