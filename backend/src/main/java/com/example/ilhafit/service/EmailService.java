package com.example.ilhafit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender emailSender;

    @Value("${spring.mail.username:ilhafit@example.com}")
    private String fromEmail;

    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            emailSender.send(message);
            log.info("Email enviado para: {}", to);
        } catch (Exception e) {
            log.error("Falha ao enviar email para: {}. Erro: {}", to, e.getMessage());
            log.info("--- EMAIL SIMULADO ---");
            log.info("Para: {}", to);
            log.info("Assunto: {}", subject);
            log.info("Texto: {}", text);
            log.info("----------------------");
        }
    }
}
