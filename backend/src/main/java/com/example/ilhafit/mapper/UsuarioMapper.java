package com.example.ilhafit.mapper;

import com.example.ilhafit.dto.UsuarioDTO;
import com.example.ilhafit.entity.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public Usuario toEntity(UsuarioDTO.Registro dto) {
        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(dto.getSenha());
        usuario.setCpf(dto.getCpf());
        return usuario;
    }

    public UsuarioDTO.Resposta toDTO(Usuario usuario) {
        UsuarioDTO.Resposta dto = new UsuarioDTO.Resposta();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setCpf(usuario.getCpf());
        dto.setRole(usuario.getRole());
        return dto;
    }
}
