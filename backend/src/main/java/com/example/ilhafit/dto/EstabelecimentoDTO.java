package com.example.ilhafit.dto;

import com.example.ilhafit.entity.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

public class EstabelecimentoDTO {

    @Data
    public static class Registro {
        @NotBlank(message = "Nome é obrigatório")
        private String nome;

        private String nomeFantasia;
        private String razaoSocial;

        @NotBlank(message = "Email é obrigatório")
        @Email(message = "Email deve ser válido")
        private String email;

        @NotBlank(message = "Senha é obrigatória")
        private String senha;

        @NotBlank(message = "Telefone é obrigatório")
        @Pattern(regexp = "\\d*", message = "Telefone deve conter apenas números")
        private String telefone;

        @NotBlank(message = "CNPJ é obrigatório")
        private String cnpj;

        private EnderecoDTO endereco;
        private Boolean exclusivoMulheres;
        private List<String> atividadesOferecidas;
        private String fotoUrl;
    }

    @Data
    public static class Resposta {
        private Long id;
        private String nome;
        private String nomeFantasia;
        private String razaoSocial;
        private String email;
        private String telefone;
        private String cnpj;
        private EnderecoDTO endereco;
        private Boolean exclusivoMulheres;
        private List<String> atividadesOferecidas;
        private String fotoUrl;
        private Role role;
    }
}
