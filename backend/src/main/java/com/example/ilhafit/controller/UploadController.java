package com.example.ilhafit.controller;

import com.example.ilhafit.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/imagem")
    public ResponseEntity<?> uploadImagem(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileStorageService.store(file);
            String fileUrl = buildFileUrl(fileName);
            return ResponseEntity.ok(Map.of(
                    "url", fileUrl,
                    "fileName", fileName,
                    "mensagem", "Imagem enviada com sucesso!"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("erro", "Erro ao processar imagem."));
        }
    }

    @PostMapping("/imagens")
    public ResponseEntity<?> uploadImagens(@RequestParam("files") MultipartFile[] files) {
        if (files.length > 10) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Máximo de 10 imagens por vez."));
        }

        List<Map<String, String>> results = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < files.length; i++) {
            try {
                String fileName = fileStorageService.store(files[i]);
                String fileUrl = buildFileUrl(fileName);
                results.add(Map.of("url", fileUrl, "fileName", fileName));
            } catch (IllegalArgumentException e) {
                errors.add("Arquivo " + (i + 1) + ": " + e.getMessage());
            } catch (IOException e) {
                errors.add("Arquivo " + (i + 1) + ": Erro ao processar imagem.");
            }
        }

        return ResponseEntity.ok(Map.of(
                "imagens", results,
                "erros", errors,
                "total", results.size()
        ));
    }

    @DeleteMapping("/imagem")
    public ResponseEntity<?> deleteImagem(@RequestParam("fileName") String fileName) {
        // Prevenir path traversal
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Nome de arquivo inválido."));
        }

        boolean deleted = fileStorageService.delete(fileName);
        if (deleted) {
            return ResponseEntity.ok(Map.of("mensagem", "Imagem removida com sucesso."));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    private String buildFileUrl(String fileName) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(fileName)
                .toUriString();
    }
}
