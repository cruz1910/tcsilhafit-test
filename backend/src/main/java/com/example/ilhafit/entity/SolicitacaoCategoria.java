package com.example.ilhafit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "solicitacoes_categorias")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitacaoCategoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "solicitante_email", nullable = false)
    private String solicitanteEmail;

    @Column(nullable = false)
    private String nome;

    @Column(length = 500)
    private String descricao;

    @Column(name = "icone_url")
    private String iconeUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusSolicitacao status = StatusSolicitacao.PENDENTE;

    @Column(name = "data_solicitacao", nullable = false, updatable = false)
    private LocalDateTime dataSolicitacao;

    @PrePersist
    protected void onCreate() {
        dataSolicitacao = LocalDateTime.now();
    }
}
