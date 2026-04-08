package com.example.ilhafit;

import com.example.ilhafit.service.EmailService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Classe base para todos os testes de integração.
 *
 * - Carrega o contexto Spring completo com banco H2 em memória.
 * - @Transactional garante rollback após cada teste (sem vazamento de dados).
 * - @MockBean EmailService evita chamadas SMTP reais nos testes.
 * - Helpers para registrar usuários e obter tokens JWT.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    /** Substitui o EmailService real por um mock (sem envio de e-mails). */
    @MockBean
    protected EmailService emailService;

    // ── Senhas e sufixos ────────────────────────────────────────────────────

    protected static final String SENHA_PADRAO = "Senha@123";
    protected static final String SENHA_ADMIN  = "Admin@12345";

    /** Gera sufixo único de 12 chars hexadecimais para emails/CPFs/CNPJs. */
    protected String uid() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    // ── Registro de usuários ────────────────────────────────────────────────

    protected String registrarUsuarioEObterToken(String email, String senha) throws Exception {
        String cpf = "1" + uid().replaceAll("[^0-9]", "0").substring(0, 10);
        mockMvc.perform(post("/api/usuarios/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "User Teste",
                                "email", email,
                                "senha", senha,
                                "cpf", cpf
                        ))))
                .andExpect(status().isCreated());
        return login(email, senha);
    }

    protected String registrarEstabelecimentoEObterToken(String email, String senha) throws Exception {
        String sufixo = uid();
        mockMvc.perform(post("/api/estabelecimentos/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Estab Teste " + sufixo,
                                "email", email,
                                "senha", senha,
                                "telefone", "48" + sufixo.replaceAll("[^0-9]", "9").substring(0, 9),
                                "cnpj", "1" + sufixo.replaceAll("[^0-9]", "1") + "0001"
                        ))))
                .andExpect(status().isCreated());
        return login(email, senha);
    }

    protected String registrarProfissionalEObterToken(String email, String senha) throws Exception {
        String sufixo = uid();
        String cpf = "3" + sufixo.replaceAll("[^0-9]", "0").substring(0, 10);
        mockMvc.perform(post("/api/profissionais/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Prof Teste " + sufixo,
                                "email", email,
                                "senha", senha,
                                "telefone", "47" + sufixo.replaceAll("[^0-9]", "9").substring(0, 9),
                                "cpf", cpf
                        ))))
                .andExpect(status().isCreated());
        return login(email, senha);
    }

    protected String registrarAdminEObterToken(String email, String senha) throws Exception {
        mockMvc.perform(post("/api/administradores/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Admin Teste",
                                "email", email,
                                "senha", senha
                        ))))
                .andExpect(status().isCreated());
        return login(email, senha);
    }

    // ── Login ────────────────────────────────────────────────────────────────

    /** Faz login e retorna apenas o token JWT. */
    protected String login(String email, String senha) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/autenticacao/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "senha", senha
                        ))))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("token").asText();
    }

    /** Faz login e retorna o body completo (id, token, role, etc.). */
    protected JsonNode loginCompleto(String email, String senha) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/autenticacao/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "senha", senha
                        ))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    // ── Header de autorização ────────────────────────────────────────────────

    protected org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
    comToken(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder builder, String token) {
        return builder.header("Authorization", "Bearer " + token);
    }

    // ── Parse de resposta ─────────────────────────────────────────────────────

    protected Long extrairId(MvcResult result) throws Exception {
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("id").asLong();
    }

    protected JsonNode parseJson(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }
}
