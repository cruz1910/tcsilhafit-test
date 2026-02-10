package com.example.ilhafit.mapper;

import com.example.ilhafit.dto.ProfissionalDTO;
import com.example.ilhafit.entity.Profissional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProfissionalMapper {

    private final EnderecoMapper enderecoMapper;

    public Profissional toEntity(ProfissionalDTO.Registro dto) {
        Profissional pro = new Profissional();
        pro.setNome(dto.getNome());
        pro.setEmail(dto.getEmail());
        pro.setSenha(dto.getSenha());
        pro.setTelefone(dto.getTelefone());
        pro.setCpf(dto.getCpf());
        pro.setEspecializacao(dto.getEspecializacao());
        pro.setRegistroCref(dto.getRegistroCref());
        pro.setEndereco(enderecoMapper.toEntity(dto.getEndereco()));
        pro.setExclusivoMulheres(dto.getExclusivoMulheres());
        pro.setAtividadesOferecidas(dto.getAtividadesOferecidas());
        pro.setFotoUrl(dto.getFotoUrl());
        return pro;
    }

    public ProfissionalDTO.Resposta toDTO(Profissional pro) {
        ProfissionalDTO.Resposta dto = new ProfissionalDTO.Resposta();
        dto.setId(pro.getId());
        dto.setNome(pro.getNome());
        dto.setEmail(pro.getEmail());
        dto.setTelefone(pro.getTelefone());
        dto.setCpf(pro.getCpf());
        dto.setEspecializacao(pro.getEspecializacao());
        dto.setRegistroCref(pro.getRegistroCref());
        dto.setEndereco(enderecoMapper.toDTO(pro.getEndereco()));
        dto.setExclusivoMulheres(pro.getExclusivoMulheres());
        dto.setAtividadesOferecidas(pro.getAtividadesOferecidas());
        dto.setFotoUrl(pro.getFotoUrl());
        dto.setRole(pro.getRole());
        return dto;
    }
}
