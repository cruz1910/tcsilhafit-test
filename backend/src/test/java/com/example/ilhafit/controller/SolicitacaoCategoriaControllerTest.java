package com.example.ilhafit.controller;

import com.example.ilhafit.BaseIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Solicitação de Categoria — regras de negócio e fluxo de aprovação")
class SolicitacaoCategoriaControllerTest extends BaseIntegrationTest {

    // ── Positivos ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("9.1 Usuário autenticado solicita nova categoria com sucesso")
    void solicitarCategoria() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);

        mockMvc.perform(comToken(post("/api/solicitacoes-categorias"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "NovaCategoria_" + uid,
                                "descricao", "Descrição da categoria"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDENTE"))
                .andExpect(jsonPath("$.nome").value("NovaCategoria_" + uid));
    }

    @Test
    @DisplayName("9.2 GET /minhas retorna apenas solicitações do próprio usuário")
    void listarMinhasSolicitacoes() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);

        mockMvc.perform(comToken(post("/api/solicitacoes-categorias"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", "Minha_" + uid))))
                .andExpect(status().isOk());

        mockMvc.perform(comToken(get("/api/solicitacoes-categorias/minhas"), userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.nome == 'Minha_" + uid + "')]").exists());
    }

    @Test
    @DisplayName("9.3 ADMIN lista todas as solicitações")
    void adminListaTodasSolicitacoes() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);

        mockMvc.perform(comToken(get("/api/solicitacoes-categorias"), adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("9.4 ADMIN filtra solicitações por status PENDENTE")
    void adminFiltraPorStatus() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);

        mockMvc.perform(comToken(get("/api/solicitacoes-categorias?status=PENDENTE"), adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("9.5 ADMIN aprova solicitação — status APROVADA e categoria criada")
    void adminAprovaSolicitacao() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);
        String userToken  = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);
        String nomeCategoria = "Aprovada_" + uid;

        MvcResult result = mockMvc.perform(comToken(post("/api/solicitacoes-categorias"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", nomeCategoria))))
                .andExpect(status().isOk())
                .andReturn();

        Long solicitacaoId = extrairId(result);

        mockMvc.perform(comToken(
                        patch("/api/solicitacoes-categorias/" + solicitacaoId + "/aprovar"), adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APROVADA"));

        // Verifica que a categoria foi criada
        mockMvc.perform(get("/api/categorias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.nome == '" + nomeCategoria + "')]").exists());
    }

    @Test
    @DisplayName("9.6 ADMIN rejeita solicitação — status REJEITADA")
    void adminRejeitaSolicitacao() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);
        String userToken  = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);

        MvcResult result = mockMvc.perform(comToken(post("/api/solicitacoes-categorias"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", "Rejeitada_" + uid))))
                .andExpect(status().isOk())
                .andReturn();

        Long solicitacaoId = extrairId(result);

        mockMvc.perform(comToken(
                        patch("/api/solicitacoes-categorias/" + solicitacaoId + "/rejeitar"), adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJEITADA"));
    }

    // ── Negativos ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("9.7 Não autenticado não pode solicitar categoria — retorna 403")
    void naoAutenticadoNaoSolicita() throws Exception {
        mockMvc.perform(post("/api/solicitacoes-categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", "Hack_" + uid()))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("9.8 Não-ADMIN não pode aprovar solicitação — retorna 403")
    void naoAdminNaoAprovaSolicitacao() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);

        mockMvc.perform(comToken(patch("/api/solicitacoes-categorias/1/aprovar"), userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("9.9 Usuário com 3 pendentes não pode criar 4ª solicitação")
    void limiteDeTreeSolicitacoesPendentes() throws Exception {
        String uid       = uid();
        String userToken = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);

        // Cria 3 solicitações
        for (int i = 1; i <= 3; i++) {
            mockMvc.perform(comToken(post("/api/solicitacoes-categorias"), userToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(Map.of("nome", "Cat" + i + "_" + uid))))
                    .andExpect(status().isOk());
        }

        // 4ª deve ser bloqueada — retorna 409 (limite excedido)
        mockMvc.perform(comToken(post("/api/solicitacoes-categorias"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", "Cat4_" + uid))))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("9.10 Solicitar categoria com nome já existente retorna 400")
    void solicitarCategoriaNomeExistente() throws Exception {
        String uid        = uid();
        String adminToken = registrarAdminEObterToken("admin_" + uid + "@test.com", SENHA_ADMIN);
        String userToken  = registrarUsuarioEObterToken("user_" + uid + "@test.com", SENHA_PADRAO);
        String nome       = "CatExistente_" + uid;

        // Cria categoria diretamente
        mockMvc.perform(comToken(post("/api/categorias"), adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", nome))))
                .andExpect(status().isCreated());

        // Tenta solicitar com mesmo nome
        mockMvc.perform(comToken(post("/api/solicitacoes-categorias"), userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("nome", nome))))
                .andExpect(status().isBadRequest());
    }
}
