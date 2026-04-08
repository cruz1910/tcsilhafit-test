package com.example.ilhafit.controller;

import com.example.ilhafit.BaseIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Categoria — CRUD e acesso público")
class CategoriaControllerTest extends BaseIntegrationTest {

    @Test
    @DisplayName("7.1 GET /api/categorias sem autenticação retorna 200 (público)")
    void listarCategoriasPublico() throws Exception {
        mockMvc.perform(get("/api/categorias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("7.2 ADMIN cria categoria com sucesso")
    void adminCriaCategoria() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);

        mockMvc.perform(comToken(post("/api/categorias"), adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Esporte_" + uid,
                                "descricao", "Descrição do esporte"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Esporte_" + uid))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    @DisplayName("7.3 Não-ADMIN não pode criar categoria — retorna 403")
    void naoAdminNaoCriaCategoria() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);

        mockMvc.perform(comToken(post("/api/categorias"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Hack_" + uid
                        ))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("7.4 ADMIN cria categoria com nome duplicado retorna 400")
    void adminCriaCategoriaNomeDuplicado() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);
        String nome       = "CatDup_" + uid;

        mockMvc.perform(comToken(post("/api/categorias"), adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", nome))))
                .andExpect(status().isCreated());

        mockMvc.perform(comToken(post("/api/categorias"), adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", nome))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("7.5 ADMIN atualiza categoria com sucesso")
    void adminAtualizaCategoria() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);

        MvcResult result = mockMvc.perform(comToken(post("/api/categorias"), adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", "Original_" + uid))))
                .andExpect(status().isCreated())
                .andReturn();

        Long id = extrairId(result);

        // PUT retorna {"mensagem": "...", "categoria": {...}}
        mockMvc.perform(comToken(put("/api/categorias/" + id), adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", "Atualizado_" + uid))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoria.nome").value("Atualizado_" + uid));
    }

    @Test
    @DisplayName("7.6 ADMIN deleta categoria com sucesso")
    void adminDeletaCategoria() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);

        MvcResult result = mockMvc.perform(comToken(post("/api/categorias"), adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", "ParaDeletar_" + uid))))
                .andExpect(status().isCreated())
                .andReturn();

        Long id = extrairId(result);

        mockMvc.perform(comToken(delete("/api/categorias/" + id), adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("7.7 GET categoria por ID inexistente retorna 400 ou 404")
    void buscarCategoriaPorIdInexistente() throws Exception {
        mockMvc.perform(get("/api/categorias/999999999"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 400 || status == 404
                            : "Esperado 400 ou 404, mas foi: " + status;
                });
    }
}
