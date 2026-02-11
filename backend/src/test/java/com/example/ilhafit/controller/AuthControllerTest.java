package com.example.ilhafit.controller;

import com.example.ilhafit.dto.LoginDTO;
import com.example.ilhafit.dto.UsuarioDTO;
import com.example.ilhafit.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional 
public class AuthControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private AuthService authService;

        @Test
        public void deveRegistrarELogarUsuarioComSucesso() throws Exception {
              
                UsuarioDTO.Registro registro = new UsuarioDTO.Registro();
                registro.setNome("Teste Segurança");
                registro.setEmail("teste.seguranca@example.com");
                registro.setSenha("senhaForte123");
               

                mockMvc.perform(post("/api/usuarios/registrar")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(registro)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.email").value("teste.seguranca@example.com"));

                LoginDTO.Request login = new LoginDTO.Request();
                login.setEmail("teste.seguranca@example.com");
                login.setSenha("senhaForte123");

                mockMvc.perform(post("/api/autenticacao/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(login)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.token").exists())
                                .andExpect(jsonPath("$.role").value("USER"));
        }

        @Test
        public void deveFalharLoginComSenhaIncorreta() throws Exception {
        
                UsuarioDTO.Registro registro = new UsuarioDTO.Registro();
                registro.setNome("Teste Falha");
                registro.setEmail("teste.falha@example.com");
                registro.setSenha("senhaCerta");

                mockMvc.perform(post("/api/usuarios/registrar")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(registro)))
                                .andExpect(status().isCreated());

        
                LoginDTO.Request login = new LoginDTO.Request();
                login.setEmail("teste.falha@example.com");
                login.setSenha("senhaErrada");

                mockMvc.perform(post("/api/autenticacao/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(login)))
                                .andExpect(status().isUnauthorized()); 
        }
}
