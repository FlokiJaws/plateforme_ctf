package com.jee.service;

import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Duration;

@ApplicationScoped
public class JwtService {

    public String generateToken(String email, String pseudo, String role) {

        // Implémentation de la génération de token JWT
        return Jwt.issuer("ctf-rootyou")
                .subject(email)
                .claim("pseudo", pseudo)
                .groups(role)
                .expiresIn(Duration.ofHours(1))
                .sign();
    }
}