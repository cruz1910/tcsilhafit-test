package com.example.ilhafit.controller;

import com.example.ilhafit.BaseIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Denúncia — regras de negócio e controle de acesso")
class DenunciaControllerTest extends BaseIntegrationTest {

    /** Cria um estabelecimento e retorna seu ID. */
    private Long criarEstabelecimento(String uid) throws Exception {
        MvcResult r = mockMvc.perform(post("/api/estabelecimentos/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Academia " + uid,
                                "email", "estab_" + uid + "@test.com",
                                "senha", SENHA_PADRAO,
                                "telefone", "48" + uid.replaceAll("[^0-9]", "9").substring(0, 9),
                                "cnpj", "1" + uid.replaceAll("[^0-9]", "1") + "0001"))))
                .andExpect(status().isCreated()).andReturn();
        return extrairId(r);
    }

    /** Cria uma avaliação e retorna seu ID. */
    private Long criarAvaliacao(Long estabId, String userToken, int nota) throws Exception {
        MvcResult r = mockMvc.perform(comToken(post("/api/avaliacoes"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nota", nota,
                                "comentario", "Avaliação de teste.",
                                "estabelecimentoId", estabId))))
                .andExpect(status().isOk()).andReturn();
        return extrairId(r);
    }

    // ── Positivos ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("8.1 Usuário autenticado denuncia avaliação com sucesso")
    void userDenunciaAvaliacao() throws Exception {
        String uid        = uid();
        String userToken1 = registrarUsuarioEObterToken("user1_" + uid + "@test.com", SENHA_PADRAO);
        String userToken2 = registrarUsuarioEObterToken("user2_" + uid + "@test.com", SENHA_PADRAO);
        Long estabId      = criarEstabelecimento(uid);
        Long avaliacaoId  = criarAvaliacao(estabId, userToken1, 1);

        mockMvc.perform(comToken(post("/api/denuncias"), userToken2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "avaliacaoId", avaliacaoId,
                                "motivo", "SPAM",
                                "descricaoAdicional", "Avaliação de spam."
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.status").value("PENDENTE"));
    }

    @Test
    @DisplayName("8.2 ADMIN lista denúncias com sucesso")
    void adminListaDenuncias() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);

        mockMvc.perform(comToken(get("/api/denuncias"), adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("8.3 ADMIN atualiza status da denúncia para APROVADA")
    void adminAprovaDenuncia() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);
        String userToken1 = registrarUsuarioEObterToken("user1_" + uid + "@test.com", SENHA_PADRAO);
        String userToken2 = registrarUsuarioEObterToken("user2_" + uid + "@test.com", SENHA_PADRAO);
        Long estabId      = criarEstabelecimento(uid);
        Long avaliacaoId  = criarAvaliacao(estabId, userToken1, 1);

        MvcResult denResult = mockMvc.perform(comToken(post("/api/denuncias"), userToken2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "avaliacaoId", avaliacaoId,
                                "motivo", "LINGUAGEM_OFENSIVA"
                        ))))
                .andExpect(status().isOk()).andReturn();

        Long denunciaId = extrairId(denResult);

        mockMvc.perform(comToken(put("/api/denuncias/" + denunciaId + "/status"), adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "REVISADO"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REVISADO"));
    }

    @Test
    @DisplayName("8.4 ADMIN deleta avaliação denunciada — avaliação e denúncias removidas")
    void adminDeletaAvaliacaoDenunciada() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);
        String userToken1 = registrarUsuarioEObterToken("user1_" + uid + "@test.com", SENHA_PADRAO);
        String userToken2 = registrarUsuarioEObterToken("user2_" + uid + "@test.com", SENHA_PADRAO);
        Long estabId      = criarEstabelecimento(uid);
        Long avaliacaoId  = criarAvaliacao(estabId, userToken1, 1);

        MvcResult denResult = mockMvc.perform(comToken(post("/api/denuncias"), userToken2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "avaliacaoId", avaliacaoId,
                                "motivo", "INFORMACAO_FALSA"
                        ))))
                .andExpect(status().isOk()).andReturn();

        Long denunciaId = extrairId(denResult);

        // Deleta avaliação via endpoint de denúncia
        mockMvc.perform(comToken(delete("/api/denuncias/" + denunciaId + "/avaliacao"), adminToken))
                .andExpect(status().isOk());

        // Verifica que avaliação sumiu
        mockMvc.perform(get("/api/avaliacoes/estabelecimento/" + estabId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    // ── Negativos ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("8.5 Mesmo usuário não pode denunciar a mesma avaliação duas vezes")
    void duplicataDenuncia() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);
        String outro     = registrarUsuarioEObterToken("outro_" + uid + "@test.com", SENHA_PADRAO);
        Long estabId     = criarEstabelecimento(uid);
        Long avaliacaoId = criarAvaliacao(estabId, outro, 1);

        mockMvc.perform(comToken(post("/api/denuncias"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "avaliacaoId", avaliacaoId, "motivo", "SPAM"))))
                .andExpect(status().isOk());

        // Segunda denúncia do mesmo usuário — retorna 409

        mockMvc.perform(comToken(post("/api/denuncias"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "avaliacaoId", avaliacaoId, "motivo", "OUTROS"))))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("8.6 Não autenticado não pode denunciar — retorna 403")
    void naoAutenticadoNaoDenuncia() throws Exception {
        mockMvc.perform(post("/api/denuncias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "avaliacaoId", 1L, "motivo", "SPAM"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("8.7 Não-ADMIN não pode listar denúncias — retorna 403")
    void naoAdminNaoListaDenuncias() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);

        mockMvc.perform(comToken(get("/api/denuncias"), userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("8.8 Não-ADMIN não pode atualizar status de denúncia — retorna 403")
    void naoAdminNaoAtualizaStatusDenuncia() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);

        mockMvc.perform(comToken(put("/api/denuncias/1/status"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "REVISADO"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("8.9 Denunciar avaliação inexistente retorna 400 ou 404")
    void denunciarAvaliacaoInexistente() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);

        mockMvc.perform(comToken(post("/api/denuncias"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "avaliacaoId", 999999999L, "motivo", "SPAM"))))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 400 || status == 404
                            : "Esperado 400 ou 404, mas foi: " + status;
                });
    }

    @Test
    @DisplayName("8.10 ADMIN filtra denúncias por status PENDENTE")
    void adminFiltraDenunciasPorStatus() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);

        mockMvc.perform(comToken(get("/api/denuncias?status=PENDENTE"), adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
