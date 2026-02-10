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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.example.ilhafit.dto.LoginDTO;
import java.util.Optional;

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

    public LoginDTO.Response login(LoginDTO.Request dto) {
        // Tenta buscar em cada repositório

        // 1. Usuário
        Optional<Usuario> usuario = usuarioRepository.findByEmail(dto.getEmail());
        if (usuario.isPresent() && usuario.get().getSenha().equals(dto.getSenha())) {
            return LoginDTO.Response.builder()
                    .id(usuario.get().getId())
                    .nome(usuario.get().getNome())
                    .email(usuario.get().getEmail())
                    .role(usuario.get().getRole().name())
                    .build();
        }

        // 2. Estabelecimento
        Optional<Estabelecimento> est = estabelecimentoRepository.findByEmail(dto.getEmail());
        if (est.isPresent() && est.get().getSenha().equals(dto.getSenha())) {
            return LoginDTO.Response.builder()
                    .id(est.get().getId())
                    .nome(est.get().getNome())
                    .email(est.get().getEmail())
                    .role(est.get().getRole().name())
                    .build();
        }

        // 3. Administrador
        Optional<Administrador> admin = administradorRepository.findByEmail(dto.getEmail());
        if (admin.isPresent() && admin.get().getSenha().equals(dto.getSenha())) {
            return LoginDTO.Response.builder()
                    .id(admin.get().getId())
                    .nome(admin.get().getNome())
                    .email(admin.get().getEmail())
                    .role(admin.get().getRole().name())
                    .build();
        }

        // 4. Profissional
        Optional<Profissional> prof = profissionalRepository.findByEmail(dto.getEmail());
        if (prof.isPresent() && prof.get().getSenha().equals(dto.getSenha())) {
            return LoginDTO.Response.builder()
                    .id(prof.get().getId())
                    .nome(prof.get().getNome())
                    .email(prof.get().getEmail())
                    .role(prof.get().getRole().name())
                    .build();
        }

        throw new RuntimeException("Credenciais inválidas");
    }

    public UsuarioDTO.Resposta registerUsuario(UsuarioDTO.Registro dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        Usuario usuario = usuarioMapper.toEntity(dto);
        usuario.setRole(Role.USER);
        usuario = usuarioRepository.save(usuario);
        return usuarioMapper.toDTO(usuario);
    }

    public EstabelecimentoDTO.Resposta registerEstabelecimento(EstabelecimentoDTO.Registro dto) {
        if (estabelecimentoRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        Estabelecimento estabelecimento = estabelecimentoMapper.toEntity(dto);
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
        admin.setRole(Role.ADMIN);
        admin = administradorRepository.save(admin);
        return administradorMapper.toDTO(admin);
    }

    public ProfissionalDTO.Resposta registerProfissional(ProfissionalDTO.Registro dto) {
        if (profissionalRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        Profissional profissional = profissionalMapper.toEntity(dto);
        profissional.setRole(Role.PROFISSIONAL);
        profissional = profissionalRepository.save(profissional);
        return profissionalMapper.toDTO(profissional);
    }
}
