package com.example.ilhafit.repository;

import com.example.ilhafit.entity.SolicitacaoCategoria;
import com.example.ilhafit.entity.StatusSolicitacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitacaoCategoriaRepository extends JpaRepository<SolicitacaoCategoria, Long> {

    long countBySolicitanteEmailAndStatus(String email, StatusSolicitacao status);

    List<SolicitacaoCategoria> findBySolicitanteEmailOrderByDataSolicitacaoDesc(String email);

    List<SolicitacaoCategoria> findAllByOrderByDataSolicitacaoDesc();

    List<SolicitacaoCategoria> findByStatusOrderByDataSolicitacaoDesc(StatusSolicitacao status);
}
