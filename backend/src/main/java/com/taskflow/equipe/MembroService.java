package com.taskflow.equipe;

import com.taskflow.dominio.Campos;
import com.taskflow.dominio.Papel;
import com.taskflow.dominio.Tarefa;
import com.taskflow.dominio.TarefaRepository;
import com.taskflow.dominio.Usuario;
import com.taskflow.dominio.UsuarioRepository;
import com.taskflow.erro.CodigoErroApi;
import com.taskflow.erro.ErroDeAplicacao;
import com.taskflow.erro.MensagensApi;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MembroService {

    private static final int MAXIMO_CARACTERES_EMAIL = 150;

    private final AcessoEquipe acesso;
    private final UsuarioRepository usuarioRepository;
    private final TarefaRepository tarefaRepository;

    public MembroService(
            AcessoEquipe acesso,
            UsuarioRepository usuarioRepository,
            TarefaRepository tarefaRepository) {
        this.acesso = acesso;
        this.usuarioRepository = usuarioRepository;
        this.tarefaRepository = tarefaRepository;
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
        String email = Campos.emailObrigatorio(emailInformado, MensagensApi.CAMPO_EMAIL, MAXIMO_CARACTERES_EMAIL)
                .toLowerCase(Locale.ROOT);
        Usuario alvo = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ErroDeAplicacao(CodigoErroApi.USUARIO_NAO_ENCONTRADO));
        if (alvo.temEquipe()) {
            throw new ErroDeAplicacao(CodigoErroApi.USUARIO_JA_TEM_EQUIPE);
        }
        alvo.entrarNaEquipe(dono.getEquipe(), Papel.MEMBRO);
        return MembroResponse.de(usuarioRepository.save(alvo));
    }

    /**
     * Remove o membro da equipe e passa suas tarefas ao Dono, tudo na mesma transação.
     * O usuário é atualizado primeiro; qualquer falha depois disso desfaz a remoção.
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
        usuarioRepository.saveAndFlush(alvo);
        List<Tarefa> tarefas = tarefaRepository.findByResponsavelId(alvo.getId());
        tarefas.forEach(tarefa -> tarefa.atribuirA(dono));
        tarefaRepository.saveAll(tarefas);
    }
}
