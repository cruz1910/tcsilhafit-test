package com.example.ilhafit.service;

import com.example.ilhafit.dto.EstabelecimentoDTO;
import com.example.ilhafit.entity.Estabelecimento;
import com.example.ilhafit.entity.Role;
import com.example.ilhafit.mapper.EstabelecimentoMapper;
import com.example.ilhafit.repository.EstabelecimentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EstabelecimentoService {

    private final EstabelecimentoRepository estabelecimentoRepository;
    private final EstabelecimentoMapper estabelecimentoMapper;

    @Transactional
    public EstabelecimentoDTO.Resposta cadastrar(EstabelecimentoDTO.Registro dto) {
        if (estabelecimentoRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado");
        }
        if (estabelecimentoRepository.existsByCnpj(dto.getCnpj())) {
            throw new IllegalArgumentException("CNPJ já cadastrado");
        }
        Estabelecimento estabelecimento = estabelecimentoMapper.toEntity(dto);
        estabelecimento.setRole(Role.ESTABELECIMENTO);
        return estabelecimentoMapper.toDTO(estabelecimentoRepository.save(estabelecimento));
    }

    public List<EstabelecimentoDTO.Resposta> listarTodos() {
        return estabelecimentoRepository.findAll().stream()
                .map(estabelecimentoMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<EstabelecimentoDTO.Resposta> buscarPorId(Long id) {
        return estabelecimentoRepository.findById(id)
                .map(estabelecimentoMapper::toDTO);
    }

    public Optional<EstabelecimentoDTO.Resposta> buscarPorEmail(String email) {
        return estabelecimentoRepository.findByEmail(email)
                .map(estabelecimentoMapper::toDTO);
    }

    @Transactional
    public EstabelecimentoDTO.Resposta atualizar(Long id, EstabelecimentoDTO.Registro dto) {
        Estabelecimento estabelecimento = estabelecimentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Estabelecimento não encontrado"));

        Estabelecimento atualizado = estabelecimentoMapper.toEntity(dto);
        atualizado.setId(id);
        atualizado.setRole(estabelecimento.getRole());

        return estabelecimentoMapper.toDTO(estabelecimentoRepository.save(atualizado));
    }

    @Transactional
    public void deletar(Long id) {
        if (!estabelecimentoRepository.existsById(id)) {
            throw new IllegalArgumentException("Estabelecimento não encontrado");
        }
        estabelecimentoRepository.deleteById(id);
    }
}
