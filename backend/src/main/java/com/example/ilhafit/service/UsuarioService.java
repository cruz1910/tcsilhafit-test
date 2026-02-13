package com.example.ilhafit.service;

import com.example.ilhafit.dto.UsuarioDTO;
import com.example.ilhafit.entity.Role;
import com.example.ilhafit.entity.Usuario;
import com.example.ilhafit.mapper.UsuarioMapper;
import com.example.ilhafit.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import com.example.ilhafit.repository.AvaliacaoRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final AvaliacaoRepository avaliacaoRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioDTO.Resposta cadastrar(UsuarioDTO.Registro dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado");
        }
        if (usuarioRepository.existsByCpf(dto.getCpf())) {
            throw new IllegalArgumentException("CPF já cadastrado");
        }
        Usuario usuario = usuarioMapper.toEntity(dto);
        usuario.setRole(Role.USER);
        usuario.setSenha(passwordEncoder.encode(dto.getSenha())); // Encode password on registration
        return usuarioMapper.toDTO(usuarioRepository.save(usuario));
    }

    public List<UsuarioDTO.Resposta> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(usuarioMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<UsuarioDTO.Resposta> buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(usuarioMapper::toDTO);
    }

    public Optional<UsuarioDTO.Resposta> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuarioMapper::toDTO);
    }

    @Transactional
    public UsuarioDTO.Resposta atualizar(Long id, UsuarioDTO.Registro dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        // Update fields manually
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setCpf(dto.getCpf());

        // Password update logic
        if (dto.getSenha() != null && !dto.getSenha().trim().isEmpty()) {
            usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        return usuarioMapper.toDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public void deletar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new IllegalArgumentException("Usuário não encontrado");
        }
        avaliacaoRepository.deleteByAutorId(id); // Cascade delete reviews
        usuarioRepository.deleteById(id);
    }
}
