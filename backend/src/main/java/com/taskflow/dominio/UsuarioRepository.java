package com.taskflow.dominio;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Usuario> findByEquipeIdOrderByNomeAsc(Long equipeId);

    Optional<Usuario> findByIdAndEquipeId(Long id, Long equipeId);
}
