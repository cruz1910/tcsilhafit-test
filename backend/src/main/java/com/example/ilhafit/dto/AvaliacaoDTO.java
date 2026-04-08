package com.example.ilhafit.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class AvaliacaoDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Requisicao {
        @NotNull(message = "Nota é obrigatória")
        @Min(value = 1, message = "Nota mínima é 1")
        @Max(value = 5, message = "Nota máxima é 5")
        private Integer nota;

        @NotBlank(message = "Comentário é obrigatório")
        private String comentario;
        private Long estabelecimentoId;
        private Long profissionalId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Resposta {
        private Long id;
        private Integer nota;
        private String comentario;
        private String nomeAutor;
        private LocalDateTime dataAvaliacao;
    }
}
