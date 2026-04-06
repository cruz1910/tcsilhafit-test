package com.example.ilhafit.controller;

import com.example.ilhafit.dto.SolicitacaoCategoriaDTO;
import com.example.ilhafit.entity.StatusSolicitacao;
import com.example.ilhafit.service.SolicitacaoCategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/solicitacoes-categorias")
@RequiredArgsConstructor
public class SolicitacaoCategoriaController {

    private final SolicitacaoCategoriaService service;

    @PostMapping
    public ResponseEntity<?> solicitar(
            @Valid @RequestBody SolicitacaoCategoriaDTO.Requisicao dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            return ResponseEntity.ok(service.solicitar(dto, userDetails.getUsername()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("erro", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> listar(
            @RequestParam(required = false) StatusSolicitacao status) {
        if (status != null) {
            return ResponseEntity.ok(service.listarPorStatus(status));
        }
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/minhas")
    public ResponseEntity<?> minhas(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.listarMinhas(userDetails.getUsername()));
    }

    @PatchMapping("/{id}/aprovar")
    public ResponseEntity<?> aprovar(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.aprovar(id));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("erro", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("erro", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/rejeitar")
    public ResponseEntity<?> rejeitar(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.rejeitar(id));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("erro", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("erro", e.getMessage()));
        }
    }
}
