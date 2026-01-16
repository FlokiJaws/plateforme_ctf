package com.jee.controller;

import com.jee.entity.enums.ParticipationFilter;
import com.jee.service.ParticipantService;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/participants")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ParticipantController {
    @Inject
    ParticipantService participantService;
    @Inject
    SecurityIdentity identity;

    @GET
    @Path("/me/participations")
    @Authenticated
    public Response getMyParticipations(@QueryParam("filter") @DefaultValue("ALL") ParticipationFilter filter) {
        String participantEmail = identity.getPrincipal().getName();
        return Response.ok(participantService.getParticipationsByFilter(participantEmail, filter)).build();
    }
}
