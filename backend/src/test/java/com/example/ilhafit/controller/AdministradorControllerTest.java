package com.example.ilhafit.controller;

import com.example.ilhafit.BaseIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Administrador — CRUD e acesso")
class AdministradorControllerTest extends BaseIntegrationTest {

    @Test
    @DisplayName("5.1 Registrar admin com email .com retorna 201")
    void registrarAdminValido() throws Exception {
        String uid = uid();
        mockMvc.perform(post("/api/administradores/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Admin Válido",
                                "email", "admin_" + uid + "@empresa.com",
                                "senha", SENHA_ADMIN
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @DisplayName("5.2 Registrar admin com email sem .com retorna 400")
    void registrarAdminEmailSemDotCom() throws Exception {
        mockMvc.perform(post("/api/administradores/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Admin Inválido",
                                "email", "admin_" + uid() + "@empresa.org",
                                "senha", SENHA_ADMIN
                        ))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("5.3 ADMIN lista todos os admins com sucesso")
    void adminListaAdmins() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);

        mockMvc.perform(comToken(get("/api/administradores"), adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("5.4 Não-ADMIN não pode listar admins — retorna 403")
    void naoAdminNaoListaAdmins() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);

        mockMvc.perform(comToken(get("/api/administradores"), userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("5.5 ADMIN atualiza outro admin com sucesso")
    void adminAtualizaAdmin() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_main_" + uid + "@test.com", SENHA_ADMIN);

        MvcResult result = mockMvc.perform(post("/api/administradores/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Admin Alvo",
                                "email", "admin_alvo_" + uid + "@test.com",
                                "senha", SENHA_ADMIN
                        ))))
                .andExpect(status().isCreated())
                .andReturn();

        Long id = extrairId(result);

        mockMvc.perform(comToken(put("/api/administradores/" + id), adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Admin Atualizado",
                                "email", "admin_alvo_" + uid + "@test.com",
                                "senha", SENHA_ADMIN
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Admin Atualizado"));
    }

    @Test
    @DisplayName("5.6 ADMIN deleta admin existente com sucesso")
    void adminDeletaAdmin() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_del_main_" + uid + "@test.com", SENHA_ADMIN);

        MvcResult result = mockMvc.perform(post("/api/administradores/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Admin Para Deletar",
                                "email", "admin_del_" + uid + "@test.com",
                                "senha", SENHA_ADMIN
                        ))))
                .andExpect(status().isCreated())
                .andReturn();

        Long id = extrairId(result);

        mockMvc.perform(comToken(delete("/api/administradores/" + id), adminToken))
                .andExpect(status().isOk());
    }
}
