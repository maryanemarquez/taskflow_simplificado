package com.taskflow.erro;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** Único ponto de log da aplicação. Uma exceção passada como último argumento sai com stack trace. */
@Component
public class RegistroEventos {

    private static final Logger LOGGER = LoggerFactory.getLogger(RegistroEventos.class);

    public void registrar(EventoLog evento, Object... argumentos) {
        String modelo = evento.modelo();
        switch (evento.nivel()) {
            case ERROR -> LOGGER.error(modelo, argumentos);
            case WARN -> LOGGER.warn(modelo, argumentos);
            case INFO -> LOGGER.info(modelo, argumentos);
            default -> LOGGER.debug(modelo, argumentos);
        }
    }
}
