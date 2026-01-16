package com.jee.controller;

import com.jee.DTO.auth.LoginRequest;
import com.jee.DTO.auth.RegisterAdministrateurRequest;
import com.jee.DTO.auth.RegisterOrganisateurRequest;
import com.jee.DTO.auth.RegisterParticipantRequest;
import com.jee.entity.User;
import com.jee.service.AuthService;
import com.jee.service.JwtService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/auth")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AuthController {

    @Inject
    AuthService authService;

    @Inject
    JwtService jwtService;

    @POST
    @Path("/register/participant")
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    public Response registerParticipant(RegisterParticipantRequest body) {
            authService.registerParticipant(body.email, body.pseudo, body.password);
            return Response.status(201).build();
    }

    @POST
    @Path("/register/organisateur")
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    public Response registerOrganisateur(RegisterOrganisateurRequest body) {
            authService.registerOrganisateur(
                    body.email,
                    body.pseudo,
                    body.password,
                    body.organisation);
            return Response.status(201).build();
    }

    @POST
    @Path("/register/admin")
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    @RolesAllowed("ADMINISTRATEUR")
    public Response registerAdmin(RegisterAdministrateurRequest body) {

            authService.registerAdmin(body.email, body.pseudo, body.password);
            return Response.status(201).build();
    }



    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/login")
    public Response login(LoginRequest body) {
        User user = authService.authenticate(
                body.email,
                body.password
        );

        // Générer un token JWT pour l'utilisateur authentifié avec son rôle
        String token = jwtService.generateToken(user.getEmail(),user.getPseudo(), user.getRole().name());
        return Response.ok(token).build();
    }
}
