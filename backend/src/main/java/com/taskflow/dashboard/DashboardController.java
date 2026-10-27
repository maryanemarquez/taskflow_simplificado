package com.taskflow.dashboard;

import com.taskflow.auth.UsuarioAutenticado;
import com.taskflow.configuracao.Rotas;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(Rotas.DASHBOARD)
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse consultar(
            @UsuarioAutenticado long usuarioId) {
        return dashboardService.consultar(usuarioId);
    }
}
