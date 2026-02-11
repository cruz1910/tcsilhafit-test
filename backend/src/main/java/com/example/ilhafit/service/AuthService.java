package com.example.ilhafit.service;

import com.example.ilhafit.dto.AdministradorDTO;
import com.example.ilhafit.dto.EstabelecimentoDTO;
import com.example.ilhafit.dto.ProfissionalDTO;
import com.example.ilhafit.dto.UsuarioDTO;
import com.example.ilhafit.entity.Administrador;
import com.example.ilhafit.entity.Estabelecimento;
import com.example.ilhafit.entity.Profissional;
import com.example.ilhafit.entity.Role;
import com.example.ilhafit.entity.Usuario;
import com.example.ilhafit.mapper.AdministradorMapper;
import com.example.ilhafit.mapper.EstabelecimentoMapper;
import com.example.ilhafit.mapper.ProfissionalMapper;
import com.example.ilhafit.mapper.UsuarioMapper;
import com.example.ilhafit.repository.AdministradorRepository;
import com.example.ilhafit.repository.EstabelecimentoRepository;
import com.example.ilhafit.repository.PasswordResetTokenRepository;
import com.example.ilhafit.repository.ProfissionalRepository;
import com.example.ilhafit.repository.UsuarioRepository;
import com.example.ilhafit.repository.VerificationTokenRepository;
import com.example.ilhafit.security.JwtTokenProvider;
import com.example.ilhafit.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.ilhafit.dto.LoginDTO;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final EstabelecimentoRepository estabelecimentoRepository;
    private final AdministradorRepository administradorRepository;
    private final ProfissionalRepository profissionalRepository;

    private final UsuarioMapper usuarioMapper;
    private final EstabelecimentoMapper estabelecimentoMapper;
    private final AdministradorMapper administradorMapper;
    private final ProfissionalMapper profissionalMapper;

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;

    private final String FRONTEND_URL = "http://localhost:5173";

    public LoginDTO.Response login(LoginDTO.Request dto) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getSenha()));

        String token = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        return LoginDTO.Response.builder()
                .token(token)
                .id(userPrincipal.getId())
                .nome(userPrincipal.getNome())
                .email(userPrincipal.getEmail())
                .role(userPrincipal.getRole().name())
                .build();
    }

    // --- Recuperação de Senha ---

    public void forgotPassword(String email) {
        // Verifica se email existe em alguma das tabelas
        if (!usuarioRepository.existsByEmail(email) &&
                !estabelecimentoRepository.existsByEmail(email) &&
                !administradorRepository.existsByEmail(email) &&
                !profissionalRepository.existsByEmail(email)) {
            throw new RuntimeException("Email não encontrado");
        }

        // Gera token
        String token = java.util.UUID.randomUUID().toString();
        // Remove token anterior se existir (opcional, mas boa prática)
        // passwordResetTokenRepository.deleteByEmail(email); // Se tiver esse método

        com.example.ilhafit.entity.PasswordResetToken myToken = new com.example.ilhafit.entity.PasswordResetToken(token,
                email);
        passwordResetTokenRepository.save(myToken);

        // Envia email
        String link = FRONTEND_URL + "/redefinir-senha?token=" + token;
        String text = "Olá,\n\nVocê solicitou a redefinição de sua senha.\nClique no link abaixo para redefinir:\n"
                + link;
        emailService.sendSimpleMessage(email, "Redefinição de Senha - IlhaFit", text);
    }

    public void resetPassword(String token, String newPassword) {
        com.example.ilhafit.entity.PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (resetToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Token expirado");
        }

        String email = resetToken.getEmail();
        String encodedPassword = passwordEncoder.encode(newPassword);

        // Atualiza senha nas tabelas (onde encontrar o email)
        usuarioRepository.findByEmail(email).ifPresent(user -> {
            user.setSenha(encodedPassword);
            usuarioRepository.save(user);
        });

        estabelecimentoRepository.findByEmail(email).ifPresent(user -> {
            user.setSenha(encodedPassword);
            estabelecimentoRepository.save(user);
        });

        administradorRepository.findByEmail(email).ifPresent(user -> {
            user.setSenha(encodedPassword);
            administradorRepository.save(user);
        });

        profissionalRepository.findByEmail(email).ifPresent(user -> {
            user.setSenha(encodedPassword);
            profissionalRepository.save(user);
        });

        passwordResetTokenRepository.delete(resetToken);
    }

    // --- Confirmação de Email ---

    public void confirmEmail(String token) {
        com.example.ilhafit.entity.VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (verificationToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Token expirado");
        }

        String email = verificationToken.getEmail();
        // Em um cenário real, aqui ativaríamos o usuário: user.setEnabled(true);
        System.out.println("Email confirmado para: " + email);

        verificationTokenRepository.delete(verificationToken);
    }

    private void sendVerificationEmail(String email) {
        String token = java.util.UUID.randomUUID().toString();
        com.example.ilhafit.entity.VerificationToken myToken = new com.example.ilhafit.entity.VerificationToken(token,
                email);
        verificationTokenRepository.save(myToken);

        String link = FRONTEND_URL + "/confirmar-email?token=" + token;
        String text = "Bem-vindo ao IlhaFit!\n\nClique no link abaixo para confirmar seu email:\n" + link;
        emailService.sendSimpleMessage(email, "Confirmação de Email - IlhaFit", text);
    }

    public UsuarioDTO.Resposta registerUsuario(UsuarioDTO.Registro dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        Usuario usuario = usuarioMapper.toEntity(dto);
        usuario.setSenha(passwordEncoder.encode(dto.getSenha())); // Criptografa senha
        usuario.setRole(Role.USER);
        usuario = usuarioRepository.save(usuario);

        sendVerificationEmail(usuario.getEmail());

        return usuarioMapper.toDTO(usuario);
    }

    public EstabelecimentoDTO.Resposta registerEstabelecimento(EstabelecimentoDTO.Registro dto) {
        if (estabelecimentoRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        Estabelecimento estabelecimento = estabelecimentoMapper.toEntity(dto);
        estabelecimento.setSenha(passwordEncoder.encode(dto.getSenha())); // Criptografa senha
        estabelecimento.setRole(Role.ESTABELECIMENTO);
        if (estabelecimento.getNomeFantasia() == null || estabelecimento.getNomeFantasia().trim().isEmpty()) {
            estabelecimento.setNomeFantasia(estabelecimento.getNome());
        }
        if (estabelecimento.getRazaoSocial() == null || estabelecimento.getRazaoSocial().trim().isEmpty()) {
            estabelecimento.setRazaoSocial(estabelecimento.getNome());
        }
        estabelecimento = estabelecimentoRepository.save(estabelecimento);
        return estabelecimentoMapper.toDTO(estabelecimento);
    }

    public AdministradorDTO.Resposta registerAdministrador(AdministradorDTO.Registro dto) {
        if (administradorRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        Administrador admin = administradorMapper.toEntity(dto);
        admin.setSenha(passwordEncoder.encode(dto.getSenha())); // Criptografa senha
        admin.setRole(Role.ADMIN);
        admin = administradorRepository.save(admin);
        return administradorMapper.toDTO(admin);
    }

    public ProfissionalDTO.Resposta registerProfissional(ProfissionalDTO.Registro dto) {
        if (profissionalRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        Profissional profissional = profissionalMapper.toEntity(dto);
        profissional.setSenha(passwordEncoder.encode(dto.getSenha())); // Criptografa senha
        profissional.setRole(Role.PROFISSIONAL);
        profissional = profissionalRepository.save(profissional);
        return profissionalMapper.toDTO(profissional);
    }
}
