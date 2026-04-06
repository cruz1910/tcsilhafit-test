package com.example.ilhafit.mapper;

import com.example.ilhafit.dto.CategoriaDTO;
import com.example.ilhafit.dto.EstabelecimentoDTO;
import com.example.ilhafit.dto.GradeAtividadeDTO;
import com.example.ilhafit.entity.Categoria;
import com.example.ilhafit.entity.Estabelecimento;
import com.example.ilhafit.entity.GradeAtividade;
import com.example.ilhafit.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EstabelecimentoMapper {

    private final EnderecoMapper enderecoMapper;
    private final CategoriaRepository categoriaRepository;

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
        if (dto.getGradeAtividades() != null) {
            est.setGradeAtividades(dto.getGradeAtividades().stream().map(g -> {
                GradeAtividade entity = new GradeAtividade();
                entity.setAtividade(g.getAtividade());
                entity.setExclusivoMulheres(g.getExclusivoMulheres());
                entity.setDiasSemana(g.getDiasSemana());
                entity.setPeriodos(g.getPeriodos());
                return entity;
            }).toList());
        }
        est.setFotosUrl(dto.getFotosUrl());
        est.setOutrosAtividade(dto.getOutrosAtividade());
        est.setInstagram(dto.getInstagram());
        est.setFacebook(dto.getFacebook());
        est.setWebsite(dto.getWebsite());
        if (dto.getCategoriaIds() != null && !dto.getCategoriaIds().isEmpty()) {
            List<Categoria> categorias = categoriaRepository.findAllById(dto.getCategoriaIds());
            est.setCategorias(new ArrayList<>(categorias));
        }
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
        if (est.getGradeAtividades() != null) {
            dto.setGradeAtividades(est.getGradeAtividades().stream().map(g -> {
                GradeAtividadeDTO.Resposta d = new GradeAtividadeDTO.Resposta();
                d.setId(g.getId());
                d.setAtividade(g.getAtividade());
                d.setExclusivoMulheres(g.getExclusivoMulheres());
                d.setDiasSemana(g.getDiasSemana());
                d.setPeriodos(g.getPeriodos());
                return d;
            }).toList());
        }
        dto.setFotosUrl(est.getFotosUrl());
        dto.setOutrosAtividade(est.getOutrosAtividade());
        dto.setInstagram(est.getInstagram());
        dto.setFacebook(est.getFacebook());
        dto.setWebsite(est.getWebsite());
        dto.setRole(est.getRole());
        if (est.getCategorias() != null) {
            dto.setCategorias(est.getCategorias().stream().map(c -> {
                CategoriaDTO.Resposta cd = new CategoriaDTO.Resposta();
                cd.setId(c.getId());
                cd.setNome(c.getNome());
                cd.setDescricao(c.getDescricao());
                cd.setIconeUrl(c.getIconeUrl());
                return cd;
            }).toList());
        }
        return dto;
    }
}
