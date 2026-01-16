package com.jee.controller;

import com.jee.DTO.equipe.CandidatureDecisionRequest;
import com.jee.DTO.equipe.EquipeCreateRequest;
import com.jee.DTO.equipe.KickMembreRequest;
import com.jee.DTO.equipe.NewChefEquipeRequest;
import com.jee.entity.enums.StatutCandidature;
import com.jee.service.EquipeService;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/equipes")
@Produces(MediaType.APPLICATION_JSON)
public class EquipeController {

    @Inject
    EquipeService equipeService;
    @Inject
    SecurityIdentity identity;

    @POST
    @Path("/new")
    @Authenticated
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createEquipe(EquipeCreateRequest request) {
        String emailChefEquipe = identity.getPrincipal().getName();
        equipeService.createEquipe(request.nomEquipe, emailChefEquipe);
        return Response.status(Response.Status.CREATED).build();
    }

    @POST
    @Path("/request")
    @Authenticated
    public Response joinEquipe(@QueryParam("equipeId") String equipeId) {
        String participantEmail = identity.getPrincipal().getName();
        equipeService.requestToJoinEquipe(Long.parseLong(equipeId), participantEmail);
        return Response.status(Response.Status.OK).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Authenticated
    @Path("/respond_to_request")
    public Response respondToRequest(CandidatureDecisionRequest request) {
        String chefEquipeEmail = identity.getPrincipal().getName();
        equipeService.respondToRequest(request.candidatureId, request.accept, chefEquipeEmail);
        return Response.status(Response.Status.OK).build();
    }

    @POST
    @Path("/leave")
    @Authenticated
    public Response leaveEquipe(@QueryParam("equipeId") String equipeId) {
        String participantEmail = identity.getPrincipal().getName();
        equipeService.leaveEquipe(Long.parseLong(equipeId), participantEmail);
        return Response.status(Response.Status.OK).build();
    }

    @POST
    @Path("/kick")
    @Consumes(MediaType.APPLICATION_JSON)
    @Authenticated
    public Response kickMembre(KickMembreRequest request) {
        String chefEquipeEmail = identity.getPrincipal().getName();
        equipeService.kick(request.equipeId, request.membreEmail, chefEquipeEmail);
        return Response.status(Response.Status.OK).build();
    }

    @POST
    @Path("/designate_new_chef")
    @Authenticated
    @Consumes(MediaType.APPLICATION_JSON)
    public Response designateNewChef(NewChefEquipeRequest request) {
        String currentChefEmail = identity.getPrincipal().getName();
        equipeService.changeChefEquipe(currentChefEmail, request.newChefEmail, request.equipeId);
        return Response.status(Response.Status.OK).build();
    }

    @GET
    @Path("/all")
    @Produces(MediaType.APPLICATION_JSON)
    @Authenticated
    public Response getAllEquipes() {
        return Response.status(Response.Status.OK).entity(equipeService.getAllEquipes()).build();
    }

    @GET
    @Path("/{equipeId}")
    @Authenticated
    public Response getEquipeById(@PathParam("equipeId") Long equipeId) {
        return Response.status(Response.Status.OK).entity(equipeService.getEquipeDetails(equipeId)).build();
    }

    @GET
    @Path("/{equipe_id}/members")
    @Authenticated
    public Response getEquipeMembers(@PathParam("equipe_id") Long equipeId, @QueryParam ("candidature_statut") @DefaultValue("EN_ATTENTE") StatutCandidature statut) {
        String requestedByEmail = identity.getPrincipal().getName();
        boolean isAdmin = identity.hasRole("ADMINISTRATEUR");
        return Response.status(Response.Status.OK).entity(equipeService.getEquipeMembersDetails(equipeId, statut, requestedByEmail, isAdmin)).build();
    }
}
