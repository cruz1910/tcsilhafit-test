package com.example.ilhafit.controller;

import com.example.ilhafit.dto.AvaliacaoDTO;
import com.example.ilhafit.service.AvaliacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/avaliacoes")
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    @PostMapping
    public ResponseEntity<AvaliacaoDTO.Resposta> avaliar(
            @Valid @RequestBody AvaliacaoDTO.Requisicao dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(avaliacaoService.avaliar(dto, userDetails.getUsername()));
    }

    @GetMapping("/estabelecimento/{id}")
    public ResponseEntity<List<AvaliacaoDTO.Resposta>> listarPorEstabelecimento(@PathVariable Long id) {
        return ResponseEntity.ok(avaliacaoService.listarPorEstabelecimento(id));
    }
}
