package com.example.ilhafit.controller;

import com.example.ilhafit.BaseIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Grade de Atividades — CRUD e controle de acesso")
class GradeAtividadeControllerTest extends BaseIntegrationTest {

    private Long criarEstabelecimento(String uid) throws Exception {
        MvcResult r = mockMvc.perform(post("/api/estabelecimentos/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Academia " + uid,
                                "email", "egrad_" + uid + "@test.com",
                                "senha", SENHA_PADRAO,
                                "telefone", "48" + uid.replaceAll("[^0-9]", "9").substring(0, 9),
                                "cnpj", "2" + uid.replaceAll("[^0-9]", "2") + "0002"))))
                .andExpect(status().isCreated()).andReturn();
        return extrairId(r);
    }

    private Long criarProfissional(String uid) throws Exception {
        MvcResult r = mockMvc.perform(post("/api/profissionais/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Prof " + uid,
                                "email", "pgrad_" + uid + "@test.com",
                                "senha", SENHA_PADRAO,
                                "telefone", "47" + uid.replaceAll("[^0-9]", "9").substring(0, 9),
                                "cpf", "8" + uid.replaceAll("[^0-9]", "8").substring(0, 10)))))
                .andExpect(status().isCreated()).andReturn();
        return extrairId(r);
    }

    @Test
    @DisplayName("10.1 ADMIN adiciona atividade a estabelecimento com sucesso")
    void adminAdicionaAtividadeEstabelecimento() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);
        Long estabId      = criarEstabelecimento(uid);

        mockMvc.perform(comToken(
                        post("/api/grade-atividades/estabelecimento/" + estabId), adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "atividade", "Musculação",
                                "exclusivoMulheres", false,
                                "diasSemana", List.of("SEG", "QUA", "SEX"),
                                "periodos", List.of("MANHA", "TARDE")
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.atividade").value("Musculação"));
    }

    @Test
    @DisplayName("10.2 ADMIN adiciona atividade a profissional com sucesso")
    void adminAdicionaAtividadeProfissional() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);
        Long profId       = criarProfissional(uid);

        mockMvc.perform(comToken(
                        post("/api/grade-atividades/profissional/" + profId), adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "atividade", "Yoga",
                                "exclusivoMulheres", true,
                                "diasSemana", List.of("TER", "QUI"),
                                "periodos", List.of("MANHA")
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.atividade").value("Yoga"));
    }

    @Test
    @DisplayName("10.3 GET atividades de estabelecimento sem auth retorna 200 (público)")
    void listarAtividadesEstabelecimentoPublico() throws Exception {
        String uid   = uid();
        Long estabId = criarEstabelecimento(uid);

        mockMvc.perform(get("/api/grade-atividades/estabelecimento/" + estabId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("10.4 ADMIN atualiza atividade com sucesso")
    void adminAtualizaAtividade() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);
        Long estabId      = criarEstabelecimento(uid);

        MvcResult result = mockMvc.perform(comToken(
                        post("/api/grade-atividades/estabelecimento/" + estabId), adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "atividade", "Pilates",
                                "diasSemana", List.of("SEG"),
                                "periodos", List.of("TARDE")
                        ))))
                .andExpect(status().isCreated()).andReturn();

        Long gradeId = extrairId(result);

        mockMvc.perform(comToken(put("/api/grade-atividades/" + gradeId), adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "atividade", "Pilates Avançado",
                                "diasSemana", List.of("SEG", "QUA"),
                                "periodos", List.of("MANHA", "TARDE")
                        ))))
                .andExpect(status().isOk())
                // PUT retorna {"mensagem": "...", "atividade": {...}}
                .andExpect(jsonPath("$.atividade.atividade").value("Pilates Avançado"));
    }

    @Test
    @DisplayName("10.5 ADMIN deleta atividade com sucesso")
    void adminDeletaAtividade() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);
        Long estabId      = criarEstabelecimento(uid);

        MvcResult result = mockMvc.perform(comToken(
                        post("/api/grade-atividades/estabelecimento/" + estabId), adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "atividade", "Zumba",
                                "diasSemana", List.of("SEX"),
                                "periodos", List.of("NOITE")
                        ))))
                .andExpect(status().isCreated()).andReturn();

        Long gradeId = extrairId(result);

        mockMvc.perform(comToken(delete("/api/grade-atividades/" + gradeId), adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("10.6 Não-ADMIN não pode adicionar atividade — retorna 403")
    void naoAdminNaoAdicionaAtividade() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);
        Long estabId     = criarEstabelecimento(uid);

        mockMvc.perform(comToken(
                        post("/api/grade-atividades/estabelecimento/" + estabId), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "atividade", "Hack",
                                "diasSemana", List.of("SEG"),
                                "periodos", List.of("MANHA")
                        ))))
                .andExpect(status().isForbidden());
    }
}
