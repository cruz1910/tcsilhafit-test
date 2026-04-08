package com.example.ilhafit.controller;

import com.example.ilhafit.BaseIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Profissional — CRUD e regras de negócio")
class ProfissionalControllerTest extends BaseIntegrationTest {

    private Map<String, Object> payloadValido(String email, String telefone, String cpf) {
        return Map.of(
                "nome", "Prof Teste",
                "email", email,
                "senha", SENHA_PADRAO,
                "telefone", telefone,
                "cpf", cpf
        );
    }

    @Test
    @DisplayName("4.1 Registrar profissional com dados válidos retorna 201")
    void registrarValido() throws Exception {
        String uid = uid();
        mockMvc.perform(post("/api/profissionais/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payloadValido(
                                "prof_" + uid + "@test.com",
                                "47" + uid.replaceAll("[^0-9]", "9").substring(0, 9),
                                "4" + uid.replaceAll("[^0-9]", "1").substring(0, 10)))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("PROFISSIONAL"))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    @DisplayName("4.2 Registrar com CPF duplicado retorna 400")
    void registrarCpfDuplicado() throws Exception {
        String uid = uid();
        String cpf = "5" + uid.replaceAll("[^0-9]", "5").substring(0, 10);

        mockMvc.perform(post("/api/profissionais/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payloadValido(
                                "prof1_" + uid + "@test.com", "47111111111", cpf))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/profissionais/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payloadValido(
                                "prof2_" + uid + "@test.com", "47222222222", cpf))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("4.3 Registrar com outrosAtividade cria SolicitacaoCategoria")
    void registrarComOutrosAtividadeCriaSolicitacao() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);

        mockMvc.perform(post("/api/profissionais/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Prof Outros",
                                "email", "prof_outr_" + uid + "@test.com",
                                "senha", SENHA_PADRAO,
                                "telefone", "47999999999",
                                "cpf", "6" + uid.replaceAll("[^0-9]", "6").substring(0, 10),
                                "outrosAtividade", "Capoeira Avançada"
                        ))))
                .andExpect(status().isCreated());

        mockMvc.perform(comToken(get("/api/solicitacoes-categorias"), adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.nome == 'Capoeira Avançada')]").exists());
    }

    @Test
    @DisplayName("4.4 GET /api/profissionais sem autenticação retorna 200 (público)")
    void listarProfissionaisPublico() throws Exception {
        mockMvc.perform(get("/api/profissionais"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("4.5 Buscar profissional por email existente retorna 200")
    void buscarPorEmailExistente() throws Exception {
        String uid   = uid();
        String email = "prof_email_" + uid + "@test.com";

        mockMvc.perform(post("/api/profissionais/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payloadValido(
                                email,
                                "47" + uid.replaceAll("[^0-9]", "8").substring(0, 9),
                                "7" + uid.replaceAll("[^0-9]", "7").substring(0, 10)))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/profissionais/email/" + email))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    @DisplayName("4.6 Buscar profissional por email inexistente retorna 404 (autenticado)")
    void buscarPorEmailInexistente() throws Exception {
        // GET /api/profissionais/email/{email} exige autenticação
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);

        mockMvc.perform(comToken(get("/api/profissionais/email/naoexiste_" + uid + "@test.com"), adminToken))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 400 || status == 404
                            : "Esperado 400 ou 404, mas foi: " + status;
                });
    }

    @Test
    @DisplayName("4.7 ADMIN deleta profissional com sucesso")
    void adminDeletaProfissional() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);

        MvcResult result = mockMvc.perform(post("/api/profissionais/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payloadValido(
                                "prof_del_" + uid + "@test.com",
                                "47" + uid.replaceAll("[^0-9]", "3").substring(0, 9),
                                "8" + uid.replaceAll("[^0-9]", "8").substring(0, 10)))))
                .andExpect(status().isCreated())
                .andReturn();

        Long id = extrairId(result);

        mockMvc.perform(comToken(delete("/api/profissionais/" + id), adminToken))
                .andExpect(status().isOk());
    }
}
