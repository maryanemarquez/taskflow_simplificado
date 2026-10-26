package com.taskflow.dominio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.taskflow.TesteIntegracaoBase;
import java.time.Instant;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;

class EsquemaJpaIntegrationTest extends TesteIntegracaoBase {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    @DisplayName("HIST-001-fundacao/C01 - entidades criam o esquema reduzido")
    void entidadesCriamAsTresTabelas() {
        for (String tabela : new String[] {"usuario", "equipe", "tarefa"}) {
            Integer total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tabela, Integer.class);
            assertThat(total).isZero();
        }
    }

    @Test
    @DisplayName("HIST-001-fundacao/C01 - tabelas antigas não existem")
    void tabelasAntigasNaoExistem() {
        for (String tabela : new String[] {"workspace", "usuario_workspace", "refresh_token"}) {
            assertThatThrownBy(() -> jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tabela, Integer.class))
                    .isInstanceOf(DataAccessException.class);
        }
    }

    @Test
    @DisplayName("HIST-001-fundacao/C01 - e-mail de usuário é único")
    void emailDeUsuarioEhUnico() {
        usuarioRepository.saveAndFlush(new Usuario("Ana", "ana@taskflow.invalid", "hash", Instant.now()));

        assertThatThrownBy(() -> usuarioRepository.saveAndFlush(
                new Usuario("Outra", "ana@taskflow.invalid", "hash", Instant.now())))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
