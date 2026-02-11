package com.example.ilhafit.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class PasswordResetToken {

    private static final int EXPIRATION = 60 * 24; // 24 horas

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    @OneToOne(targetEntity = Usuario.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = true, name = "usuario_id")
    private Usuario usuario;

    // Podemos ter tokens para outros tipos de usuários também, ou unificar a
    // referência via email apenas
    // Para simplificar e suportar todos, vamos armazenar o email e buscar o usuário
    // no momento do reset
    // Isso evita ter 4 colunas de FK ou herança complexa agora

    private String email;

    private LocalDateTime expiryDate;

    public PasswordResetToken(String token, String email) {
        this.token = token;
        this.email = email;
        this.expiryDate = LocalDateTime.now().plusMinutes(EXPIRATION);
    }
}
