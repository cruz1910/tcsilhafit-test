package com.example.ilhafit.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        StringBuilder errorMessage = new StringBuilder("Erro de validação: ");
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String message = error.getDefaultMessage();
            errorMessage.append(message).append(". ");
        });
        return ResponseEntity.badRequest().body(Map.of("erro", errorMessage.toString().trim()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex) {
        String message = "Erro de integridade de dados.";
        String detail = ex.getMostSpecificCause().getMessage();

        if (detail != null) {
            String lowerDetail = detail.toLowerCase();
            if (lowerDetail.contains("cpf")) {
                message = "Este CPF já está cadastrado no sistema.";
            } else if (lowerDetail.contains("email")) {
                message = "Este e-mail já está sendo utilizado.";
            } else if (lowerDetail.contains("cnpj")) {
                message = "Este CNPJ já está cadastrado no sistema.";
            } else if (lowerDetail.contains("telefone")) {
                message = "Este telefone já está cadastrado.";
            } else if (lowerDetail.contains("duplicate key") || lowerDetail.contains("violates unique constraint")) {
                message = "Um dos dados informados já existe em nossa base.";
            }
        }

        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("erro", message));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeExceptions(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("erro", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        return ResponseEntity.internalServerError().body(Map.of("erro", "Ocorreu um erro interno: " + ex.getMessage()));
    }

}
