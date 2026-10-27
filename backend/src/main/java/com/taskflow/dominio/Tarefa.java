package com.taskflow.dominio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tarefa", indexes = {
    @Index(name = "idx_tarefa_equipe_status", columnList = "equipe_id, status"),
    @Index(name = "idx_tarefa_responsavel", columnList = "responsavel_id")
})
public class Tarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipe_id", nullable = false)
    private Equipe equipe;

    @Column(name = "titulo", length = LimitesCampos.TITULO_TAREFA, nullable = false)
    private String titulo;

    @Column(name = "descricao", length = LimitesCampos.DESCRICAO_TAREFA)
    private String descricao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "responsavel_id", nullable = false)
    private Usuario responsavel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "criado_por_id", nullable = false)
    private Usuario criadoPor;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 15, nullable = false)
    private StatusTarefa status = StatusTarefa.PENDENTE;

    @Column(name = "prazo")
    private LocalDate prazo;

    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm;

    protected Tarefa() {
    }

    public Tarefa(Usuario criadoPor, Usuario responsavel, DadosTarefa dados, Instant criadoEm) {
        this.equipe = criadoPor.getEquipe();
        this.criadoPor = criadoPor;
        this.responsavel = responsavel;
        this.criadoEm = criadoEm;
        aplicar(dados);
    }

    public void atualizar(DadosTarefa dados) {
        aplicar(dados);
    }

    public void atribuirA(Usuario novoResponsavel) {
        this.responsavel = novoResponsavel;
    }

    public void mudarStatus(StatusTarefa novoStatus) {
        this.status = novoStatus;
    }

    public Long getId() {
        return id;
    }

    public Equipe getEquipe() {
        return equipe;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public Usuario getResponsavel() {
        return responsavel;
    }

    public StatusTarefa getStatus() {
        return status;
    }

    public LocalDate getPrazo() {
        return prazo;
    }

    private void aplicar(DadosTarefa dados) {
        this.titulo = dados.titulo();
        this.descricao = dados.descricao();
        this.prazo = dados.prazo();
    }
}
