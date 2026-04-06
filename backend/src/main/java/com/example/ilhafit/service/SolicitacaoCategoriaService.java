package com.example.ilhafit.service;

import com.example.ilhafit.dto.SolicitacaoCategoriaDTO;
import com.example.ilhafit.entity.Categoria;
import com.example.ilhafit.entity.SolicitacaoCategoria;
import com.example.ilhafit.entity.StatusSolicitacao;
import com.example.ilhafit.repository.CategoriaRepository;
import com.example.ilhafit.repository.SolicitacaoCategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SolicitacaoCategoriaService {

    private final SolicitacaoCategoriaRepository solicitacaoRepository;
    private final CategoriaRepository categoriaRepository;

    @Transactional
    public SolicitacaoCategoriaDTO.Resposta solicitar(
            SolicitacaoCategoriaDTO.Requisicao dto, String emailSolicitante) {

        if (solicitacaoRepository.countBySolicitanteEmailAndStatus(
                emailSolicitante, StatusSolicitacao.PENDENTE) >= 3) {
            throw new IllegalStateException(
                    "Você já possui 3 solicitações pendentes. " +
                    "Aguarde o admin revisar antes de enviar novas.");
        }

        if (categoriaRepository.existsByNome(dto.getNome())) {
            throw new IllegalArgumentException(
                    "Já existe uma categoria com este nome.");
        }

        SolicitacaoCategoria solicitacao = new SolicitacaoCategoria();
        solicitacao.setSolicitanteEmail(emailSolicitante);
        solicitacao.setNome(dto.getNome());
        solicitacao.setDescricao(dto.getDescricao());
        solicitacao.setIconeUrl(dto.getIconeUrl());
        solicitacao.setStatus(StatusSolicitacao.PENDENTE);

        return toResposta(solicitacaoRepository.save(solicitacao));
    }

    public List<SolicitacaoCategoriaDTO.Resposta> listarTodas() {
        return solicitacaoRepository.findAllByOrderByDataSolicitacaoDesc()
                .stream().map(this::toResposta).collect(Collectors.toList());
    }

    public List<SolicitacaoCategoriaDTO.Resposta> listarPorStatus(StatusSolicitacao status) {
        return solicitacaoRepository.findByStatusOrderByDataSolicitacaoDesc(status)
                .stream().map(this::toResposta).collect(Collectors.toList());
    }

    public List<SolicitacaoCategoriaDTO.Resposta> listarMinhas(String email) {
        return solicitacaoRepository.findBySolicitanteEmailOrderByDataSolicitacaoDesc(email)
                .stream().map(this::toResposta).collect(Collectors.toList());
    }

    @Transactional
    public SolicitacaoCategoriaDTO.Resposta aprovar(Long id) {
        SolicitacaoCategoria solicitacao = solicitacaoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada."));

        if (solicitacao.getStatus() != StatusSolicitacao.PENDENTE) {
            throw new IllegalStateException("Esta solicitação já foi processada.");
        }

        if (categoriaRepository.existsByNome(solicitacao.getNome())) {
            throw new IllegalStateException(
                    "Já existe uma categoria com o nome \"" + solicitacao.getNome() + "\".");
        }

        solicitacao.setStatus(StatusSolicitacao.APROVADA);
        solicitacaoRepository.save(solicitacao);

        Categoria categoria = new Categoria();
        categoria.setNome(solicitacao.getNome());
        categoria.setDescricao(solicitacao.getDescricao());
        categoria.setIconeUrl(solicitacao.getIconeUrl());
        categoriaRepository.save(categoria);

        return toResposta(solicitacao);
    }

    @Transactional
    public SolicitacaoCategoriaDTO.Resposta rejeitar(Long id) {
        SolicitacaoCategoria solicitacao = solicitacaoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada."));

        if (solicitacao.getStatus() != StatusSolicitacao.PENDENTE) {
            throw new IllegalStateException("Esta solicitação já foi processada.");
        }

        solicitacao.setStatus(StatusSolicitacao.REJEITADA);
        return toResposta(solicitacaoRepository.save(solicitacao));
    }

    private SolicitacaoCategoriaDTO.Resposta toResposta(SolicitacaoCategoria s) {
        return new SolicitacaoCategoriaDTO.Resposta(
                s.getId(),
                s.getSolicitanteEmail(),
                s.getNome(),
                s.getDescricao(),
                s.getIconeUrl(),
                s.getStatus(),
                s.getDataSolicitacao()
        );
    }
}
