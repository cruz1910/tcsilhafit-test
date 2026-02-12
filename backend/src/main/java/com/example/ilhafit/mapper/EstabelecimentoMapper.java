package com.example.ilhafit.mapper;

import com.example.ilhafit.dto.EstabelecimentoDTO;
import com.example.ilhafit.entity.Estabelecimento;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EstabelecimentoMapper {

    private final EnderecoMapper enderecoMapper;

    public Estabelecimento toEntity(EstabelecimentoDTO.Registro dto) {
        Estabelecimento est = new Estabelecimento();
        est.setNome(dto.getNome());
        est.setEmail(dto.getEmail());
        est.setSenha(dto.getSenha());
        est.setTelefone(dto.getTelefone());
        est.setCnpj(dto.getCnpj());
        est.setNomeFantasia(dto.getNomeFantasia());
        est.setRazaoSocial(dto.getRazaoSocial());
        est.setEndereco(enderecoMapper.toEntity(dto.getEndereco()));
        est.setExclusivoMulheres(dto.getExclusivoMulheres());
        est.setAtividadesOferecidas(dto.getAtividadesOferecidas());
        est.setFotosUrl(dto.getFotosUrl());
        return est;
    }

    public EstabelecimentoDTO.Resposta toDTO(Estabelecimento est) {
        EstabelecimentoDTO.Resposta dto = new EstabelecimentoDTO.Resposta();
        dto.setId(est.getId());
        dto.setNome(est.getNome());
        dto.setEmail(est.getEmail());
        dto.setTelefone(est.getTelefone());
        dto.setCnpj(est.getCnpj());
        dto.setNomeFantasia(est.getNomeFantasia());
        dto.setRazaoSocial(est.getRazaoSocial());
        dto.setEndereco(enderecoMapper.toDTO(est.getEndereco()));
        dto.setExclusivoMulheres(est.getExclusivoMulheres());
        dto.setAtividadesOferecidas(est.getAtividadesOferecidas());
        dto.setFotosUrl(est.getFotosUrl());
        dto.setRole(est.getRole());
        return dto;
    }
}
