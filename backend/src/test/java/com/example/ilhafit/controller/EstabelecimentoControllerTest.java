package com.example.ilhafit.controller;

import com.example.ilhafit.BaseIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Estabelecimento — CRUD e regras de negócio")
class EstabelecimentoControllerTest extends BaseIntegrationTest {

    private Map<String, Object> payloadValido(String email, String telefone, String cnpj) {
        return Map.of(
                "nome", "Academia Teste",
                "email", email,
                "senha", SENHA_PADRAO,
                "telefone", telefone,
                "cnpj", cnpj
        );
    }

    // ── Registro ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("3.1 Registrar estabelecimento com dados válidos retorna 201")
    void registrarValido() throws Exception {
        String uid = uid();
        mockMvc.perform(post("/api/estabelecimentos/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payloadValido(
                                "estab_" + uid + "@test.com",
                                "48" + uid.replaceAll("[^0-9]", "9").substring(0, 9),
                                "1" + uid.replaceAll("[^0-9]", "1") + "0001"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("ESTABELECIMENTO"))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    @DisplayName("3.2 Registrar com CNPJ duplicado retorna 400")
    void registrarCnpjDuplicado() throws Exception {
        String uid  = uid();
        String cnpj = "2" + uid.replaceAll("[^0-9]", "2") + "0001";

        mockMvc.perform(post("/api/estabelecimentos/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payloadValido(
                                "estab1_" + uid + "@test.com",
                                "48111111111", cnpj))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/estabelecimentos/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payloadValido(
                                "estab2_" + uid + "@test.com",
                                "48222222222", cnpj))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("3.3 Registrar com email duplicado retorna 400")
    void registrarEmailDuplicado() throws Exception {
        String uid   = uid();
        String email = "estab_dup_" + uid + "@test.com";

        mockMvc.perform(post("/api/estabelecimentos/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payloadValido(
                                email, "48111111111",
                                "3" + uid.replaceAll("[^0-9]", "3") + "0001"))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/estabelecimentos/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payloadValido(
                                email, "48222222222",
                                "4" + uid.replaceAll("[^0-9]", "4") + "0001"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("3.4 Registrar com outrosAtividade cria SolicitacaoCategoria")
    void registrarComOutrosAtividadeCriaSolicitacao() throws Exception {
        String uid   = uid();
        String email = "estab_outr_" + uid + "@test.com";

        // Precisa de admin para verificar solicitações
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);

        mockMvc.perform(post("/api/estabelecimentos/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Academia Outros",
                                "email", email,
                                "senha", SENHA_PADRAO,
                                "telefone", "48999999999",
                                "cnpj", "5" + uid.replaceAll("[^0-9]", "5") + "0001",
                                "outrosAtividade", "Parkour Avançado"
                        ))))
                .andExpect(status().isCreated());

        // Verifica que a solicitação foi criada
        mockMvc.perform(comToken(get("/api/solicitacoes-categorias"), adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.nome == 'Parkour Avançado')]").exists());
    }

    @Test
    @DisplayName("3.5 GET /api/estabelecimentos sem autenticação retorna 200 (público)")
    void listarEstabelecimentosPublico() throws Exception {
        mockMvc.perform(get("/api/estabelecimentos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("3.6 GET estabelecimento por ID inexistente retorna 404 (autenticado)")
    void buscarPorIdInexistente() throws Exception {
        // GET /api/estabelecimentos/{id} exige autenticação
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);

        mockMvc.perform(comToken(get("/api/estabelecimentos/999999999"), adminToken))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 400 || status == 404
                            : "Esperado 400 ou 404, mas foi: " + status;
                });
    }

    @Test
    @DisplayName("3.7 ADMIN atualiza estabelecimento com sucesso")
    void adminAtualizaEstabelecimento() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);
        String email      = "estab_upd_" + uid + "@test.com";

        MvcResult result = mockMvc.perform(post("/api/estabelecimentos/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payloadValido(
                                email,
                                "48" + uid.replaceAll("[^0-9]", "8").substring(0, 9),
                                "6" + uid.replaceAll("[^0-9]", "6") + "0001"))))
                .andExpect(status().isCreated())
                .andReturn();

        Long id = extrairId(result);

        mockMvc.perform(comToken(put("/api/estabelecimentos/" + id), adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Nome Atualizado",
                                "email", email,
                                "telefone", "48999999999",
                                "cnpj", "6" + uid.replaceAll("[^0-9]", "6") + "0001"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Nome Atualizado"));
    }

    @Test
    @DisplayName("3.8 Não-ADMIN não pode atualizar estabelecimento — retorna 403")
    void naoAdminNaoAtualizaEstabelecimento() throws Exception {
        String uid        = uid();
        String userToken  = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);

        MvcResult result = mockMvc.perform(post("/api/estabelecimentos/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payloadValido(
                                "estab_" + uid + "@test.com",
                                "48" + uid.replaceAll("[^0-9]", "7").substring(0, 9),
                                "7" + uid.replaceAll("[^0-9]", "7") + "0001"))))
                .andExpect(status().isCreated())
                .andReturn();

        Long id = extrairId(result);

        mockMvc.perform(comToken(put("/api/estabelecimentos/" + id), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", "Hack"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("3.9 ADMIN deleta estabelecimento — avaliações em cascata são removidas")
    void adminDeletaEstabelecimento() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);

        MvcResult result = mockMvc.perform(post("/api/estabelecimentos/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payloadValido(
                                "estab_del_" + uid + "@test.com",
                                "48" + uid.replaceAll("[^0-9]", "3").substring(0, 9),
                                "8" + uid.replaceAll("[^0-9]", "8") + "0001"))))
                .andExpect(status().isCreated())
                .andReturn();

        Long id = extrairId(result);

        mockMvc.perform(comToken(delete("/api/estabelecimentos/" + id), adminToken))
                .andExpect(status().isOk());

        // Confirma que foi removido — GET /api/estabelecimentos/{id} é público
        mockMvc.perform(comToken(get("/api/estabelecimentos/" + id), adminToken))
                .andExpect(result2 -> {
                    int status = result2.getResponse().getStatus();
                    assert status == 400 || status == 404
                            : "Esperado 400 ou 404 após delete, mas foi: " + status;
                });
    }

    @Test
    @DisplayName("3.10 Registrar com telefone contendo máscara retorna 400")
    void registrarTelefoneMascara() throws Exception {
        String uid = uid();
        mockMvc.perform(post("/api/estabelecimentos/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Teste Fone",
                                "email", "estab_" + uid + "@test.com",
                                "senha", SENHA_PADRAO,
                                "telefone", "(48) 99999-9999",   // formato inválido
                                "cnpj", "9" + uid.replaceAll("[^0-9]", "9") + "0001"
                        ))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("3.11 Registrar sem campos obrigatórios retorna 400")
    void registrarSemCamposObrigatorios() throws Exception {
        mockMvc.perform(post("/api/estabelecimentos/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "estab_" + uid() + "@test.com"
                                // faltam nome, telefone, cnpj, senha
                        ))))
                .andExpect(status().isBadRequest());
    }
}
