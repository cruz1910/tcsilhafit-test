package com.example.ilhafit.controller;

import com.example.ilhafit.BaseIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Usuário — CRUD e regras de negócio")
class UsuarioControllerTest extends BaseIntegrationTest {

    // ── Registro ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("2.1 Cadastrar usuário com dados válidos retorna 201")
    void cadastrarUsuarioValido() throws Exception {
        String email = "user_" + uid() + "@test.com";
        String cpf   = "1" + uid().replaceAll("[^0-9]", "0").substring(0, 10);

        mockMvc.perform(post("/api/usuarios/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "João Teste",
                                "email", email,
                                "senha", SENHA_PADRAO,
                                "cpf", cpf
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    @DisplayName("2.2 Cadastrar com email duplicado retorna 400")
    void cadastrarEmailDuplicado() throws Exception {
        String email = "user_dup_" + uid() + "@test.com";
        String cpf1  = "1" + uid().replaceAll("[^0-9]", "0").substring(0, 10);
        String cpf2  = "2" + uid().replaceAll("[^0-9]", "0").substring(0, 10);

        mockMvc.perform(post("/api/usuarios/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Primeiro", "email", email,
                                "senha", SENHA_PADRAO, "cpf", cpf1))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/usuarios/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Segundo", "email", email,
                                "senha", SENHA_PADRAO, "cpf", cpf2))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("2.3 Cadastrar com CPF duplicado retorna 400")
    void cadastrarCpfDuplicado() throws Exception {
        String cpf   = "5" + uid().replaceAll("[^0-9]", "0").substring(0, 10);
        String email1 = "user_cpf1_" + uid() + "@test.com";
        String email2 = "user_cpf2_" + uid() + "@test.com";

        mockMvc.perform(post("/api/usuarios/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Primeiro", "email", email1,
                                "senha", SENHA_PADRAO, "cpf", cpf))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/usuarios/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Segundo", "email", email2,
                                "senha", SENHA_PADRAO, "cpf", cpf))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("2.4 Cadastrar sem nome retorna 400")
    void cadastrarSemNome() throws Exception {
        mockMvc.perform(post("/api/usuarios/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "user_" + uid() + "@test.com",
                                "senha", SENHA_PADRAO,
                                "cpf", "9" + uid().replaceAll("[^0-9]", "0").substring(0, 10)
                        ))))
                .andExpect(status().isBadRequest());
    }

    // ── Listagem (apenas ADMIN) ───────────────────────────────────────────────

    @Test
    @DisplayName("2.5 ADMIN lista usuários com sucesso")
    void adminListaUsuarios() throws Exception {
        String adminEmail = "admin_" + uid() + "@test.com";
        String adminToken = registrarAdminEObterToken(adminEmail, SENHA_ADMIN);

        mockMvc.perform(comToken(get("/api/usuarios"), adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("2.6 Não-ADMIN não pode listar usuários — retorna 403")
    void naoAdminNaoListaUsuarios() throws Exception {
        String userEmail = "user_" + uid() + "@test.com";
        String userToken = registrarUsuarioEObterToken(userEmail, SENHA_PADRAO);

        mockMvc.perform(comToken(get("/api/usuarios"), userToken))
                .andExpect(status().isForbidden());
    }

    // ── Delete (apenas ADMIN) ─────────────────────────────────────────────────

    @Test
    @DisplayName("2.7 ADMIN deleta usuário existente com sucesso")
    void adminDeletaUsuario() throws Exception {
        String adminEmail = "admin_" + uid() + "@test.com";
        String adminToken = registrarAdminEObterToken(adminEmail, SENHA_ADMIN);

        // Cria usuário alvo
        String alvoEmail = "alvo_" + uid() + "@test.com";
        String cpf = "7" + uid().replaceAll("[^0-9]", "0").substring(0, 10);
        MvcResult result = mockMvc.perform(post("/api/usuarios/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Alvo Delete", "email", alvoEmail,
                                "senha", SENHA_PADRAO, "cpf", cpf))))
                .andExpect(status().isCreated())
                .andReturn();

        Long id = extrairId(result);

        mockMvc.perform(comToken(delete("/api/usuarios/" + id), adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("2.8 ADMIN tenta deletar usuário inexistente — retorna 400 ou 404")
    void adminDeletaUsuarioInexistente() throws Exception {
        String adminEmail = "admin_" + uid() + "@test.com";
        String adminToken = registrarAdminEObterToken(adminEmail, SENHA_ADMIN);

        mockMvc.perform(comToken(delete("/api/usuarios/999999999"), adminToken))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 400 || status == 404
                            : "Esperado 400 ou 404, mas foi: " + status;
                });
    }
}
