package com.example.ilhafit.controller;

import com.example.ilhafit.BaseIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Auth — autenticação e tokens")
class AuthControllerTest extends BaseIntegrationTest {

    // ── Registro ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("1.1 Login com credenciais válidas retorna JWT e role")
    void loginValido() throws Exception {
        String email = "user_" + uid() + "@test.com";
        registrarUsuarioEObterToken(email, SENHA_PADRAO);

        mockMvc.perform(post("/api/autenticacao/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email, "senha", SENHA_PADRAO))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    @DisplayName("1.2 Login com senha errada retorna 401")
    void loginSenhaErrada() throws Exception {
        String email = "user_" + uid() + "@test.com";
        registrarUsuarioEObterToken(email, SENHA_PADRAO);

        mockMvc.perform(post("/api/autenticacao/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email, "senha", "SenhaErrada@99"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("1.3 Login com email inexistente retorna 401")
    void loginEmailInexistente() throws Exception {
        mockMvc.perform(post("/api/autenticacao/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "naoexiste_" + uid() + "@test.com",
                                "senha", SENHA_PADRAO))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("1.4 Login com body vazio retorna 4xx")
    void loginBodyVazio() throws Exception {
        mockMvc.perform(post("/api/autenticacao/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("1.5 Refresh com token válido retorna novo JWT")
    void refreshTokenValido() throws Exception {
        String email = "user_" + uid() + "@test.com";
        registrarUsuarioEObterToken(email, SENHA_PADRAO);

        MvcResult loginResult = mockMvc.perform(post("/api/autenticacao/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email, "senha", SENHA_PADRAO))))
                .andExpect(status().isOk())
                .andReturn();

        String refreshToken = parseJson(loginResult).get("refreshToken").asText();

        mockMvc.perform(post("/api/autenticacao/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("1.6 Refresh com token inválido retorna 4xx")
    void refreshTokenInvalido() throws Exception {
        mockMvc.perform(post("/api/autenticacao/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", "token.invalido.aqui"))))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("1.7 Esqueci-senha com email existente retorna 200")
    void esqueciSenhaEmailExistente() throws Exception {
        String email = "user_" + uid() + "@test.com";
        registrarUsuarioEObterToken(email, SENHA_PADRAO);

        mockMvc.perform(post("/api/autenticacao/esqueci-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("1.8 Esqueci-senha com email inexistente não vaza informação (200 ou 404 sem dados sensíveis)")
    void esqueciSenhaEmailInexistente() throws Exception {
        mockMvc.perform(post("/api/autenticacao/esqueci-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "fantasma_" + uid() + "@test.com"))))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    // 200 (não vaza info), 404 (explícito) ou 400 (validação)
                    assert status == 200 || status == 404 || status == 400
                            : "Esperado 200, 400 ou 404, mas foi: " + status;
                });
    }

    @Test
    @DisplayName("1.9 Redefinir-senha com token inválido retorna 4xx")
    void redefinirSenhaTokenInvalido() throws Exception {
        mockMvc.perform(post("/api/autenticacao/redefinir-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "token", "00000000-0000-0000-0000-000000000000",
                                "novaSenha", "NovaSenha@123"))))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("1.10 Acessar rota protegida sem JWT retorna 403")
    void rotaProtegidaSemToken() throws Exception {
        mockMvc.perform(post("/api/avaliacoes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("1.11 Acessar rota protegida com JWT inválido retorna 403 ou 401")
    void rotaProtegidaTokenInvalido() throws Exception {
        mockMvc.perform(post("/api/avaliacoes")
                        .header("Authorization", "Bearer token.completamente.invalido")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 401 || status == 403
                            : "Esperado 401 ou 403, mas foi: " + status;
                });
    }

    @Test
    @DisplayName("1.12 Login como ESTABELECIMENTO retorna role correto")
    void loginEstabelecimentoRetornaRoleCorreto() throws Exception {
        String email = "estab_" + uid() + "@test.com";
        registrarEstabelecimentoEObterToken(email, SENHA_PADRAO);

        mockMvc.perform(post("/api/autenticacao/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email, "senha", SENHA_PADRAO))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ESTABELECIMENTO"));
    }
}
