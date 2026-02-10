package com.example.ilhafit.controller;

import com.example.ilhafit.dto.LoginDTO;
import com.example.ilhafit.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/autenticacao")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO.Request dto) {
        try {
            return ResponseEntity.ok(authService.login(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("erro", e.getMessage()));
        }
    }
}
