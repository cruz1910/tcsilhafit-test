package com.example.ilhafit.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI ilhaFitOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("IlhaFit API")
                        .description("Documentação dos endpoints do sistema IlhaFit")
                        .version("1.0")
                        .contact(new Contact()
                                .name("IlhaFit")
                                .email("contato@ilhafit.com")));
    }
}
