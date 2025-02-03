package com.taskflow.api.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {
    private String secretKey;
    private long expiration;
    private RefreshToken refreshToken;

    @Data
    public static class RefreshToken {
        private long expiration;
    }
}