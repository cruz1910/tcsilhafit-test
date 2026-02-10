package com.example.ilhafit.service;

import com.example.ilhafit.dto.ProfissionalDTO;
import com.example.ilhafit.entity.Profissional;
import com.example.ilhafit.entity.Role;
import com.example.ilhafit.mapper.ProfissionalMapper;
import com.example.ilhafit.repository.ProfissionalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfissionalService {

    private final ProfissionalRepository profissionalRepository;
    private final ProfissionalMapper profissionalMapper;

    @Transactional
    public ProfissionalDTO.Resposta cadastrar(ProfissionalDTO.Registro dto) {
        if (profissionalRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado");
        }
        if (profissionalRepository.existsByCpf(dto.getCpf())) {
            throw new IllegalArgumentException("CPF já cadastrado");
        }
        Profissional profissional = profissionalMapper.toEntity(dto);
        profissional.setRole(Role.PROFISSIONAL);
        return profissionalMapper.toDTO(profissionalRepository.save(profissional));
    }

    public List<ProfissionalDTO.Resposta> listarTodos() {
        return profissionalRepository.findAll().stream()
                .map(profissionalMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<ProfissionalDTO.Resposta> buscarPorId(Long id) {
        return profissionalRepository.findById(id)
                .map(profissionalMapper::toDTO);
    }

    public Optional<ProfissionalDTO.Resposta> buscarPorEmail(String email) {
        return profissionalRepository.findByEmail(email)
                .map(profissionalMapper::toDTO);
    }

    public Optional<ProfissionalDTO.Resposta> buscarPorCpf(String cpf) {
        return profissionalRepository.findByCpf(cpf)
                .map(profissionalMapper::toDTO);
    }

    @Transactional
    public ProfissionalDTO.Resposta atualizar(Long id, ProfissionalDTO.Registro dto) {
        Profissional profissional = profissionalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Profissional não encontrado"));

        Profissional atualizado = profissionalMapper.toEntity(dto);
        // Preserve ID and potentially other fields if not in DTO or handled by mapper
        atualizado.setId(id);
        atualizado.setRole(profissional.getRole()); // Preserve existing role or set default

        return profissionalMapper.toDTO(profissionalRepository.save(atualizado));
    }

    @Transactional
    public void deletar(Long id) {
        if (!profissionalRepository.existsById(id)) {
            throw new IllegalArgumentException("Profissional não encontrado");
        }
        profissionalRepository.deleteById(id);
    }
}
