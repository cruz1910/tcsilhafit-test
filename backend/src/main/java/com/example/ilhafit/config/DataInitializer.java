package com.example.ilhafit.config;

import com.example.ilhafit.entity.Administrador;
import com.example.ilhafit.entity.Role;
import com.example.ilhafit.repository.AdministradorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AdministradorRepository administradorRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "admin@admin.com";
    private static final String ADMIN_SENHA = "Admin@123";
    private static final String ADMIN_NOME  = "Administrador";

    @Override
    public void run(String... args) {
        if (!administradorRepository.existsByEmail(ADMIN_EMAIL)) {
            Administrador admin = new Administrador();
            admin.setNome(ADMIN_NOME);
            admin.setEmail(ADMIN_EMAIL);
            admin.setSenha(passwordEncoder.encode(ADMIN_SENHA));
            admin.setRole(Role.ADMIN);
            administradorRepository.save(admin);
            log.info("Admin padrão criado: {}", ADMIN_EMAIL);
        } else {
            log.info("Admin padrão já existe: {}", ADMIN_EMAIL);
        }
    }
}
