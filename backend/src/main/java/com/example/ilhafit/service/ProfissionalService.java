package com.example.ilhafit.service;

import com.example.ilhafit.dto.ProfissionalDTO;
import com.example.ilhafit.entity.Profissional;
import com.example.ilhafit.entity.Role;
import com.example.ilhafit.entity.SolicitacaoCategoria;
import com.example.ilhafit.entity.StatusSolicitacao;
import com.example.ilhafit.mapper.ProfissionalMapper;
import com.example.ilhafit.repository.CategoriaRepository;
import com.example.ilhafit.repository.ProfissionalRepository;
import com.example.ilhafit.repository.AvaliacaoRepository;
import com.example.ilhafit.repository.SolicitacaoCategoriaRepository;
import com.example.ilhafit.entity.Avaliacao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfissionalService {

    private final ProfissionalRepository profissionalRepository;
    private final ProfissionalMapper profissionalMapper;
    private final AvaliacaoRepository avaliacaoRepository;
    private final PasswordEncoder passwordEncoder;
    private final SolicitacaoCategoriaRepository solicitacaoCategoriaRepository;
    private final CategoriaRepository categoriaRepository;

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
        ProfissionalDTO.Resposta resposta = mappedWithRating(profissionalRepository.save(profissional));

        log.info("Cadastro profissional - outrosAtividade recebido: '{}'", dto.getOutrosAtividade());
        if (dto.getOutrosAtividade() != null && !dto.getOutrosAtividade().isBlank()) {
            SolicitacaoCategoria solicitacao = new SolicitacaoCategoria();
            solicitacao.setSolicitanteEmail(dto.getEmail());
            solicitacao.setNome(dto.getOutrosAtividade().trim());
            solicitacao.setStatus(StatusSolicitacao.PENDENTE);
            solicitacaoCategoriaRepository.save(solicitacao);
            log.info("SolicitacaoCategoria criada: nome='{}', email='{}'", solicitacao.getNome(), solicitacao.getSolicitanteEmail());
        }

        return resposta;
    }

    public List<ProfissionalDTO.Resposta> listarTodos() {
        return profissionalRepository.findAll().stream()
                .map(this::mappedWithRating)
                .collect(Collectors.toList());
    }

    public Optional<ProfissionalDTO.Resposta> buscarPorId(Long id) {
        return profissionalRepository.findById(id)
                .map(this::mappedWithRating);
    }

    private ProfissionalDTO.Resposta mappedWithRating(Profissional p) {
        ProfissionalDTO.Resposta dto = profissionalMapper.toDTO(p);
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByProfissionalIdOrderByDataAvaliacaoDesc(p.getId());
        if (avaliacoes.isEmpty()) {
            dto.setAvaliacao(0.0);
        } else {
            double media = avaliacoes.stream()
                    .mapToInt(Avaliacao::getNota)
                    .average()
                    .orElse(0.0);
            dto.setAvaliacao(Math.round(media * 10.0) / 10.0); // 1 casa decimal
        }
        return dto;
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

        // Atualiza campos simples
        profissional.setNome(dto.getNome());
        profissional.setEmail(dto.getEmail());
        profissional.setTelefone(dto.getTelefone());
        profissional.setCpf(dto.getCpf());
        profissional.setSexo(dto.getSexo());
        profissional.setEspecializacao(dto.getEspecializacao());
        profissional.setRegistroCref(dto.getRegistroCref());
        profissional.setExclusivoMulheres(dto.getExclusivoMulheres());
        profissional.setFotoUrl(dto.getFotoUrl()); // String direta
        profissional.setOutrosAtividade(dto.getOutrosAtividade());
        profissional.setInstagram(dto.getInstagram());
        profissional.setFacebook(dto.getFacebook());
        profissional.setWebsite(dto.getWebsite());

        // Atualiza Endereço
        if (dto.getEndereco() != null) {
            profissional.setEndereco(profissionalMapper.toEntity(dto).getEndereco());
        }

        // Atualiza Grade
        if (dto.getGradeAtividades() != null) {
            profissional.getGradeAtividades().clear();
            profissional.getGradeAtividades().addAll(profissionalMapper.toEntity(dto).getGradeAtividades());
        }

        // Atualiza Categorias
        if (dto.getCategoriaIds() != null) {
            profissional.setCategorias(new java.util.ArrayList<>(categoriaRepository.findAllById(dto.getCategoriaIds())));
        }

        // Senha
        if (dto.getSenha() != null && !dto.getSenha().trim().isEmpty()) {
            profissional.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        return mappedWithRating(profissionalRepository.save(profissional));
    }

    @Transactional
    public void deletar(Long id) {
        if (!profissionalRepository.existsById(id)) {
            throw new IllegalArgumentException("Profissional não encontrado");
        }
        avaliacaoRepository.deleteByProfissionalId(id);
        profissionalRepository.deleteById(id);
    }
}
