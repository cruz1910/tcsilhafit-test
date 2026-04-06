package com.example.ilhafit.dto;

import com.example.ilhafit.entity.StatusSolicitacao;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class SolicitacaoCategoriaDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Requisicao {
        @NotBlank(message = "Nome é obrigatório")
        private String nome;
        private String descricao;
        private String iconeUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Resposta {
        private Long id;
        private String solicitanteEmail;
        private String nome;
        private String descricao;
        private String iconeUrl;
        private StatusSolicitacao status;
        private LocalDateTime dataSolicitacao;
    }
}
