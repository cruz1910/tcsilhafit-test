package com.example.ilhafit.controller;

import com.example.ilhafit.dto.EstabelecimentoDTO;
import com.example.ilhafit.dto.ProfissionalDTO;
import com.example.ilhafit.dto.UsuarioDTO;
import com.example.ilhafit.security.UserPrincipal;
import com.example.ilhafit.service.EstabelecimentoService;
import com.example.ilhafit.service.ProfissionalService;
import com.example.ilhafit.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final UsuarioService usuarioService;
    private final EstabelecimentoService estabelecimentoService;
    private final ProfissionalService profissionalService;

    @GetMapping
    public ResponseEntity<?> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            return switch (principal.getRole().name()) {
                case "USER" -> usuarioService.buscarPorId(principal.getId())
                        .map(data -> ResponseEntity.ok((Object) data))
                        .orElse(ResponseEntity.notFound().build());
                case "ESTABELECIMENTO" -> estabelecimentoService.buscarPorId(principal.getId())
                        .map(data -> ResponseEntity.ok((Object) data))
                        .orElse(ResponseEntity.notFound().build());
                case "PROFISSIONAL" -> profissionalService.buscarPorId(principal.getId())
                        .map(data -> ResponseEntity.ok((Object) data))
                        .orElse(ResponseEntity.notFound().build());
                default -> ResponseEntity.ok(Map.of(
                        "id", principal.getId(),
                        "nome", principal.getNome(),
                        "email", principal.getEmail(),
                        "role", principal.getRole().name()
                ));
            };
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateMe(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UsuarioDTO.Registro userDto) {
        try {
            return switch (principal.getRole().name()) {
                case "USER" -> ResponseEntity.ok(usuarioService.atualizar(principal.getId(), userDto));
                default -> ResponseEntity.badRequest().body(Map.of("erro", "Use o endpoint específico do seu tipo"));
            };
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PutMapping("/estabelecimento")
    public ResponseEntity<?> updateMeEstabelecimento(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody EstabelecimentoDTO.Registro dto) {
        try {
            if (!"ESTABELECIMENTO".equals(principal.getRole().name())) {
                return ResponseEntity.status(403).body(Map.of("erro", "Acesso negado"));
            }
            return ResponseEntity.ok(estabelecimentoService.atualizar(principal.getId(), dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PutMapping("/profissional")
    public ResponseEntity<?> updateMeProfissional(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ProfissionalDTO.Registro dto) {
        try {
            if (!"PROFISSIONAL".equals(principal.getRole().name())) {
                return ResponseEntity.status(403).body(Map.of("erro", "Acesso negado"));
            }
            return ResponseEntity.ok(profissionalService.atualizar(principal.getId(), dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteMe(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            switch (principal.getRole().name()) {
                case "USER" -> usuarioService.deletar(principal.getId());
                case "ESTABELECIMENTO" -> estabelecimentoService.deletar(principal.getId());
                case "PROFISSIONAL" -> profissionalService.deletar(principal.getId());
                default -> throw new RuntimeException("Tipo de usuário não suportado");
            }
            return ResponseEntity.ok(Map.of("mensagem", "Conta excluída com sucesso"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }
}
