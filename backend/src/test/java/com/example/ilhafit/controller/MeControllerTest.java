package com.example.ilhafit.controller;

import com.example.ilhafit.BaseIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("/api/me — perfil do usuário autenticado")
class MeControllerTest extends BaseIntegrationTest {

    @Test
    @DisplayName("11.1 USER autenticado GET /me retorna seus dados")
    void userGetMe() throws Exception {
        String uid   = uid();
        String email = "user_" + uid + "@test.com";
        String token = registrarUsuarioEObterToken(email, SENHA_PADRAO);

        mockMvc.perform(comToken(get("/api/me"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("11.2 ESTABELECIMENTO GET /me retorna dados do estabelecimento")
    void estabelecimentoGetMe() throws Exception {
        String uid   = uid();
        String email = "estab_" + uid + "@test.com";
        String token = registrarEstabelecimentoEObterToken(email, SENHA_PADRAO);

        mockMvc.perform(comToken(get("/api/me"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.role").value("ESTABELECIMENTO"));
    }

    @Test
    @DisplayName("11.3 PROFISSIONAL GET /me retorna dados do profissional")
    void profissionalGetMe() throws Exception {
        String uid   = uid();
        String email = "prof_" + uid + "@test.com";
        String token = registrarProfissionalEObterToken(email, SENHA_PADRAO);

        mockMvc.perform(comToken(get("/api/me"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.role").value("PROFISSIONAL"));
    }

    @Test
    @DisplayName("11.4 GET /me sem autenticação retorna 403")
    void getMeSemAuth() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("11.5 USER atualiza próprio perfil PUT /me")
    void userAtualizaPerfil() throws Exception {
        String uid   = uid();
        String email = "user_" + uid + "@test.com";
        String cpf   = "1" + uid.replaceAll("[^0-9]", "0").substring(0, 10);
        String token = registrarUsuarioEObterToken(email, SENHA_PADRAO);

        mockMvc.perform(comToken(put("/api/me"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Nome Atualizado",
                                "email", email,
                                "cpf", cpf
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Nome Atualizado"));
    }

    @Test
    @DisplayName("11.6 ESTABELECIMENTO atualiza próprio perfil PUT /me/estabelecimento")
    void estabelecimentoAtualizaPerfil() throws Exception {
        String uid   = uid();
        String email = "estab_" + uid + "@test.com";
        String tel   = "48" + uid.replaceAll("[^0-9]", "9").substring(0, 9);
        String cnpj  = "1" + uid.replaceAll("[^0-9]", "1") + "0001";
        String token = registrarEstabelecimentoEObterToken(email, SENHA_PADRAO);

        mockMvc.perform(comToken(put("/api/me/estabelecimento"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Academia Atualizada",
                                "email", email,
                                "telefone", tel,
                                "cnpj", cnpj
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Academia Atualizada"));
    }

    @Test
    @DisplayName("11.7 PROFISSIONAL atualiza próprio perfil PUT /me/profissional")
    void profissionalAtualizaPerfil() throws Exception {
        String uid   = uid();
        String email = "prof_" + uid + "@test.com";
        String tel   = "47" + uid.replaceAll("[^0-9]", "9").substring(0, 9);
        String cpf   = "3" + uid.replaceAll("[^0-9]", "0").substring(0, 10);
        String token = registrarProfissionalEObterToken(email, SENHA_PADRAO);

        mockMvc.perform(comToken(put("/api/me/profissional"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Professor Atualizado",
                                "email", email,
                                "telefone", tel,
                                "cpf", cpf
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Professor Atualizado"));
    }

    @Test
    @DisplayName("11.8 USER deleta a própria conta DELETE /me")
    void userDeletaPropriaconta() throws Exception {
        String uid   = uid();
        String email = "user_del_" + uid + "@test.com";
        String token = registrarUsuarioEObterToken(email, SENHA_PADRAO);

        mockMvc.perform(comToken(delete("/api/me"), token))
                .andExpect(status().isOk());

        // Confirma que não consegue mais fazer login
        mockMvc.perform(post("/api/autenticacao/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email, "senha", SENHA_PADRAO))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("11.9 ESTABELECIMENTO não pode usar PUT /me (rota de USER) — retorna 4xx")
    void estabelecimentoNaoUsaRotaDeUser() throws Exception {
        String uid   = uid();
        String email = "estab_" + uid + "@test.com";
        String token = registrarEstabelecimentoEObterToken(email, SENHA_PADRAO);

        // MeController verifica o role e retorna 403 ou falha com 400 (role errado)
        mockMvc.perform(comToken(put("/api/me"), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nome", "Hack", "email", email))))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 400 || status == 403
                            : "Esperado 400 ou 403, mas foi: " + status;
                });
    }
}
