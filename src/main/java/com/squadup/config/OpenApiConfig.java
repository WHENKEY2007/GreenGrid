package com.squadup.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI 3 / Swagger configuration for SquadUp REST APIs.
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI squadUpOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SquadUp — Player Matching & Social Platform API")
                        .description("RESTful JSON API documentation for SquadUp gaming lobby platform. "
                                + "Features include player management, dynamic criteria lobby discovery, "
                                + "weighted compatibility recommendations, friendships, and real-time STOMP chat.")
                        .version("1.0.0")
                        .contact(new Contact().name("SquadUp Engineering Team").url("https://github.com/Sashankdeva/API_Proj"))
                        .license(new License().name("Apache 2.0").url("https://spring.io")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT / Hex Token")
                                        .description("Enter your Bearer authentication token obtained from POST /api/v1/auth/login")));
    }
}
