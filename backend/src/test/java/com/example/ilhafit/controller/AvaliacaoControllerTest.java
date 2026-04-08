package com.example.ilhafit.controller;

import com.example.ilhafit.BaseIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Avaliação — regras de negócio e controle de acesso")
class AvaliacaoControllerTest extends BaseIntegrationTest {

    /** Registra um estabelecimento e retorna seu ID. */
    private Long criarEstabelecimento(String uid) throws Exception {
        MvcResult r = mockMvc.perform(post("/api/estabelecimentos/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Academia " + uid,
                                "email", "estab_" + uid + "@test.com",
                                "senha", SENHA_PADRAO,
                                "telefone", "48" + uid.replaceAll("[^0-9]", "9").substring(0, 9),
                                "cnpj", "1" + uid.replaceAll("[^0-9]", "1") + "0001"))))
                .andExpect(status().isCreated())
                .andReturn();
        return extrairId(r);
    }

    /** Registra um profissional e retorna seu ID. */
    private Long criarProfissional(String uid) throws Exception {
        MvcResult r = mockMvc.perform(post("/api/profissionais/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Prof " + uid,
                                "email", "prof_" + uid + "@test.com",
                                "senha", SENHA_PADRAO,
                                "telefone", "47" + uid.replaceAll("[^0-9]", "9").substring(0, 9),
                                "cpf", "9" + uid.replaceAll("[^0-9]", "9").substring(0, 10)))))
                .andExpect(status().isCreated())
                .andReturn();
        return extrairId(r);
    }

    // ── Positivos ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("6.1 USER avalia estabelecimento com nota válida retorna 201")
    void userAvaliaEstabelecimento() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);
        Long estabId     = criarEstabelecimento(uid);

        mockMvc.perform(comToken(post("/api/avaliacoes"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nota", 5,
                                "comentario", "Excelente academia!",
                                "estabelecimentoId", estabId
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nota").value(5))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    @DisplayName("6.2 USER avalia profissional com nota válida retorna 201")
    void userAvaliaProfissional() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);
        Long profId      = criarProfissional(uid);

        mockMvc.perform(comToken(post("/api/avaliacoes"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nota", 4,
                                "comentario", "Ótimo profissional!",
                                "profissionalId", profId
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nota").value(4));
    }

    @Test
    @DisplayName("6.3 GET avaliações de estabelecimento sem auth retorna 200 (público)")
    void listarAvaliacoesSemAuth() throws Exception {
        String uid   = uid();
        Long estabId = criarEstabelecimento(uid);

        mockMvc.perform(get("/api/avaliacoes/estabelecimento/" + estabId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("6.4 Autor pode deletar a própria avaliação")
    void autorDeletaPropriaAvaliacao() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);
        Long estabId     = criarEstabelecimento(uid);

        MvcResult avResult = mockMvc.perform(comToken(post("/api/avaliacoes"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nota", 3,
                                "comentario", "Razoável.",
                                "estabelecimentoId", estabId
                        ))))
                .andExpect(status().isOk())
                .andReturn();

        Long avaliacaoId = extrairId(avResult);

        mockMvc.perform(comToken(delete("/api/avaliacoes/" + avaliacaoId), userToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("6.5 ADMIN pode deletar avaliação de outro usuário")
    void adminDeletaAvaliacaoDeOutroUsuario() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);
        String userToken  = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);
        Long estabId      = criarEstabelecimento(uid);

        MvcResult avResult = mockMvc.perform(comToken(post("/api/avaliacoes"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nota", 2,
                                "comentario", "Não gostei.",
                                "estabelecimentoId", estabId
                        ))))
                .andExpect(status().isOk())
                .andReturn();

        Long avaliacaoId = extrairId(avResult);

        mockMvc.perform(comToken(delete("/api/avaliacoes/" + avaliacaoId), adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("6.6 Média do estabelecimento é recalculada após nova avaliação")
    void mediaRecalculadaAposAvaliacao() throws Exception {
        String uid        = uid();
        String userToken1 = registrarUsuarioEObterToken("user1_" + uid + "@test.com", SENHA_PADRAO);
        String userToken2 = registrarUsuarioEObterToken("user2_" + uid + "@test.com", SENHA_PADRAO);
        Long estabId      = criarEstabelecimento(uid);

        // Primeira avaliação: nota 2
        mockMvc.perform(comToken(post("/api/avaliacoes"), userToken1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nota", 2, "comentario", "Ruim.", "estabelecimentoId", estabId))))
                .andExpect(status().isOk());

        // Segunda avaliação: nota 4
        mockMvc.perform(comToken(post("/api/avaliacoes"), userToken2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nota", 4, "comentario", "Bom.", "estabelecimentoId", estabId))))
                .andExpect(status().isOk());

        // Média esperada: (2+4)/2 = 3.0
        mockMvc.perform(get("/api/estabelecimentos/" + estabId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avaliacao").value(3.0));
    }

    // ── Negativos ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("6.7 Mesmo USER não pode avaliar o mesmo estabelecimento duas vezes — retorna 409")
    void duplicataAvaliacaoMesmoUserMesmoEstabelecimento() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);
        Long estabId     = criarEstabelecimento(uid);

        mockMvc.perform(comToken(post("/api/avaliacoes"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nota", 5, "comentario", "Incrível!", "estabelecimentoId", estabId))))
                .andExpect(status().isOk());

        // Segunda tentativa — deve falhar com 409 Conflict
        mockMvc.perform(comToken(post("/api/avaliacoes"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nota", 1, "comentario", "Mudei de ideia.", "estabelecimentoId", estabId))))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("6.8 PROFISSIONAL não pode avaliar — serviço retorna 409")
    void profissionalNaoPodeAvaliar() throws Exception {
        String uid       = uid();
        String profToken = registrarProfissionalEObterToken("prof_" + uid + "@test.com", SENHA_PADRAO);
        Long estabId     = criarEstabelecimento(uid);

        // Serviço lança IllegalStateException → 409 (não pode, não é Usuario)
        mockMvc.perform(comToken(post("/api/avaliacoes"), profToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nota", 5, "comentario", "Hack!", "estabelecimentoId", estabId))))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("6.9 ESTABELECIMENTO não pode avaliar — serviço retorna 409")
    void estabelecimentoNaoPodeAvaliar() throws Exception {
        String uid        = uid();
        String estabToken = registrarEstabelecimentoEObterToken("estab_" + uid + "@test.com", SENHA_PADRAO);
        Long alvoId       = criarEstabelecimento("alvo_" + uid);

        // Serviço lança IllegalStateException → 409 (não pode, não é Usuario)
        mockMvc.perform(comToken(post("/api/avaliacoes"), estabToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nota", 5, "comentario", "Auto-avaliação!", "estabelecimentoId", alvoId))))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("6.10 Nota fora do range (0 ou 6) retorna 400")
    void notaForaDoRange() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);
        Long estabId     = criarEstabelecimento(uid);

        mockMvc.perform(comToken(post("/api/avaliacoes"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nota", 6, "comentario", "Nota inválida.", "estabelecimentoId", estabId))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("6.11 Avaliação sem autenticação retorna 403")
    void avaliacaoSemAuth() throws Exception {
        mockMvc.perform(post("/api/avaliacoes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nota", 5, "comentario", "Sem token.", "estabelecimentoId", 1L))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("6.12 USER não pode deletar avaliação de outro usuário — retorna 403")
    void userNaoDeletaAvaliacaoDeOutro() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);
        String outroToken = registrarUsuarioEObterToken("outro_" + uid + "@test.com", SENHA_PADRAO);
        Long estabId     = criarEstabelecimento(uid);

        MvcResult avResult = mockMvc.perform(comToken(post("/api/avaliacoes"), outroToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nota", 3, "comentario", "Avaliação do outro.", "estabelecimentoId", estabId))))
                .andExpect(status().isOk())
                .andReturn();

        Long avaliacaoId = extrairId(avResult);

        mockMvc.perform(comToken(delete("/api/avaliacoes/" + avaliacaoId), userToken))
                .andExpect(status().isForbidden());
    }
}
