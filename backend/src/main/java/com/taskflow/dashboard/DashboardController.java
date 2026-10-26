package com.taskflow.dashboard;

import com.taskflow.auth.controller.AutenticacaoInterceptor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse consultar(
            @RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO_ID) Long usuarioId) {
        return dashboardService.consultar(usuarioId);
    }
}
