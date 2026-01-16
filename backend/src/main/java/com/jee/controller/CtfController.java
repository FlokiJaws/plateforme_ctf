package com.jee.controller;

import com.jee.DTO.ctf.CtfCreateRequest;
import com.jee.DTO.ctf.CtfInfoResponse;
import com.jee.DTO.ctf.UpdateCtfRequest;
import com.jee.DTO.ctf.ValidationCtfRequest;
import com.jee.entity.enums.CtfStatut;
import com.jee.entity.enums.ParticipationFilter;
import com.jee.service.CtfService;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/ctfs")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class CtfController {

    @Inject
    CtfService ctfService;
    @Inject
    SecurityIdentity jwt;

    @POST
    @Path("/request_creation")
    @RolesAllowed("ORGANISATEUR")
    public Response requestCreationCtf(CtfCreateRequest request) {
        String organisateurEmail = jwt.getPrincipal().getName();
        ctfService.createCtf(organisateurEmail, request);
        return Response.status(Response.Status.CREATED).build();
    }

    @GET
    @Path("/{id}")
    public Response getCtfById(@PathParam("id") Long id) {
        return Response.ok(ctfService.getCtfById(id)).build();
    }

    @GET
    @Path("list/actif")
    public Response getAllValidCtfs() {
        return Response.ok(ctfService.getAllCtfsByStatut(CtfStatut.ACTIF)).build();
    }

    @GET
    @Path("list/en_attente")
    public Response getAllPendingCtfs() {
        return Response.ok(ctfService.getAllCtfsByStatut(CtfStatut.EN_ATTENTE)).build();
    }

    @GET
    @Path("list/inactif")
    @RolesAllowed({"ADMINISTRATEUR","ORGANISATEUR"})
    public Response getAllRefusedCtfs() {
        return Response.ok(ctfService.getAllCtfsByStatut(CtfStatut.INACTIF)).build();
    }

    @POST
    @Path("/{id}/validation")
    @RolesAllowed("ADMINISTRATEUR")
    public Response validationCtf(@PathParam("id") Long id, ValidationCtfRequest request) {
        ctfService.ctfValidationAdmin(id, request.isValid);
        return Response.noContent().build();
    }

    @PATCH
    @Path("{id}/disable")
    @RolesAllowed({"ADMINISTRATEUR","ORGANISATEUR"})
    public Response disableCtf(@PathParam("id") Long id) {

        String email = jwt.getPrincipal().getName();
        boolean isAdmin = jwt.hasRole("ADMINISTRATEUR");

        ctfService.disableCtf(id, email, isAdmin);

        return Response.noContent().build();
    }

    @PATCH
    @Path("{id}/modify")
    @RolesAllowed({"ORGANISATEUR","ADMINISTRATEUR"})
    public Response modifyCtf(@PathParam("id") Long id, UpdateCtfRequest request) {
        String email = jwt.getPrincipal().getName();
        boolean isAdmin = jwt.hasRole("ADMINISTRATEUR");

        CtfInfoResponse response = ctfService.modifyCtf(id, isAdmin, email, request);

        return Response.ok(response).build();
    }

    @POST
    @Path("{id}/join")
    @Authenticated
    public Response joinCtf(@PathParam("id") Long id) {
        String participantEmail = jwt.getPrincipal().getName();
        ctfService.joinCtfAsSolo(id, participantEmail);
        return Response.status(Response.Status.CREATED).build();
    }

    @POST
    @Path("{id}/leave")
    @Authenticated
    public Response leaveCtf(@PathParam("id") Long id) {
        String participantEmail = jwt.getPrincipal().getName();
        ctfService.leaveCtf(id, participantEmail);
        return Response.noContent().build();
    }

    @GET
    @Path("/{id}/participations")
    @RolesAllowed({"ADMINISTRATEUR","ORGANISATEUR"})
    public Response getCtfParticipations(
            @PathParam("id") Long id,
            @QueryParam("filter") @DefaultValue("ALL") ParticipationFilter filter) {
        String email = jwt.getPrincipal().getName();
        boolean isAdmin = jwt.hasRole("ADMINISTRATEUR");

        return Response.ok(ctfService.getParticipationsByFilter(id, filter, email, isAdmin)).build();
    }
}
