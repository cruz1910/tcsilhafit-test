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
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex) {
        String message = "Erro de integridade de dados.";
        String detail = ex.getMostSpecificCause().getMessage();

        if (detail.contains("uk_") || detail.contains("duplicate key")) {
            if (detail.contains("cpf")) {
                message = "Este CPF já está cadastrado no sistema.";
            } else if (detail.contains("email")) {
                message = "Este e-mail já está sendo utilizado.";
            } else if (detail.contains("cnpj")) {
                message = "Este CNPJ já está cadastrado no sistema.";
            } else {
                message = "Um dos dados informados já existe em nossa base.";
            }
        }

        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("erro", message));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeExceptions(RuntimeException ex) {
        return ResponseEntity.status(401).body(Map.of("erro", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        return ResponseEntity.internalServerError().body(Map.of("erro", "Erro inesperado: " + ex.getMessage()));
    }
}
