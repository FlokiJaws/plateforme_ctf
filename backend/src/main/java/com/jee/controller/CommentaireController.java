package com.jee.controller;

import com.jee.DTO.commentaire.CreateCommentRequest;
import com.jee.service.CommentaireService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

@Path("/comments")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class CommentaireController {

    @Inject
    CommentaireService commentaireService;
    @Inject
    JsonWebToken jwt;

    @POST
    @Path("/new/{ctfId}")
    @Authenticated
    @Transactional
    public Response addCommentToCtf(@PathParam("ctfId") Long ctfId, CreateCommentRequest request) {
        String userEmail = jwt.getSubject();
        commentaireService.addCommentToCtf(ctfId, userEmail, request.contenu);
        return Response.status(Response.Status.CREATED).build();
    }

    @GET
    @Path("/ctf/{ctfId}")
    public Response getCommentsForCtf(@PathParam("ctfId") Long ctfId) {
        return Response.ok(commentaireService.getCommentsForCtf(ctfId)).build();
    }

    @GET
    @Authenticated
    @Path("/user/{userEmail}")
    public Response getCommentsForUser(@PathParam("userEmail") String userEmail) {
        return Response.ok(commentaireService.getCommentsForUser(userEmail)).build();
    }
}
