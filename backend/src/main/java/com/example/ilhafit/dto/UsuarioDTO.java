package com.example.ilhafit.dto;

import com.example.ilhafit.entity.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

public class UsuarioDTO {

    @Data
    public static class Registro {
        @NotBlank(message = "Nome é obrigatório")
        private String nome;

        @NotBlank(message = "Email é obrigatório")
        @Email(message = "Email deve ser válido")
        private String email;

        @NotBlank(message = "Senha é obrigatória")
        private String senha;

        private String cpf;
    }

    @Data
    public static class Resposta {
        private Long id;
        private String nome;
        private String email;
        private String cpf;
        private Role role;
    }
}
