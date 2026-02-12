package com.example.ilhafit.service;

import com.example.ilhafit.dto.AvaliacaoDTO;
import com.example.ilhafit.entity.Avaliacao;
import com.example.ilhafit.entity.Estabelecimento;
import com.example.ilhafit.entity.Usuario;
import com.example.ilhafit.repository.AvaliacaoRepository;
import com.example.ilhafit.repository.EstabelecimentoRepository;
import com.example.ilhafit.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstabelecimentoRepository estabelecimentoRepository;

    @Transactional
    public AvaliacaoDTO.Resposta avaliar(AvaliacaoDTO.Requisicao requisicao, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        Estabelecimento estabelecimento = estabelecimentoRepository.findById(requisicao.getEstabelecimentoId())
                .orElseThrow(() -> new IllegalArgumentException("Estabelecimento não encontrado"));

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setNota(requisicao.getNota());
        avaliacao.setComentario(requisicao.getComentario());
        avaliacao.setAutor(usuario);
        avaliacao.setEstabelecimento(estabelecimento);

        Avaliacao salvo = avaliacaoRepository.save(avaliacao);

        return new AvaliacaoDTO.Resposta(
                salvo.getId(),
                salvo.getNota(),
                salvo.getComentario(),
                salvo.getAutor().getNome(),
                salvo.getDataAvaliacao());
    }

    public List<AvaliacaoDTO.Resposta> listarPorEstabelecimento(Long id) {
        return avaliacaoRepository.findByEstabelecimentoIdOrderByDataAvaliacaoDesc(id)
                .stream()
                .map(a -> new AvaliacaoDTO.Resposta(
                        a.getId(),
                        a.getNota(),
                        a.getComentario(),
                        a.getAutor().getNome(),
                        a.getDataAvaliacao()))
                .collect(Collectors.toList());
    }
}
