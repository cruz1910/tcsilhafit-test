package com.example.ilhafit.repository;

import com.example.ilhafit.entity.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    List<Avaliacao> findByEstabelecimentoIdOrderByDataAvaliacaoDesc(Long estabelecimentoId);

    void deleteByEstabelecimentoId(Long estabelecimentoId);

    void deleteByAutorId(Long autorId);
}
