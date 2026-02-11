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
import com.example.ilhafit.repository.ProfissionalRepository;
import com.example.ilhafit.repository.UsuarioRepository;
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

    public LoginDTO.Response login(LoginDTO.Request dto) {
        // Autentica usando Spring Security (chama o CustomUserDetailsService)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getSenha()));

        // Gera o token JWT
        String token = tokenProvider.generateToken(authentication);

        // Obtém os detalhes do usuário autenticado para retornar na resposta
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        return LoginDTO.Response.builder()
                .token(token)
                .id(userPrincipal.getId())
                .nome(userPrincipal.getNome())
                .email(userPrincipal.getEmail())
                .role(userPrincipal.getRole().name())
                .build();
    }

    public UsuarioDTO.Resposta registerUsuario(UsuarioDTO.Registro dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        Usuario usuario = usuarioMapper.toEntity(dto);
        usuario.setSenha(passwordEncoder.encode(dto.getSenha())); // Criptografa senha
        usuario.setRole(Role.USER);
        usuario = usuarioRepository.save(usuario);
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
