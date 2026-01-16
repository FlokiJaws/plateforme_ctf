package com.jee.controller;

import com.jee.DTO.defi.DefiDetailsResponse;
import com.jee.entity.Defi;
import com.jee.service.DefiService;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

@Path("/defis")
public class DefiController {

    @Inject
    DefiService defiService;

    @POST
    @Path("/create")
    @RolesAllowed("ADMINISTRATEUR")
    public Response createDefi(Defi defi) {
        defiService.createDefi(
                defi.getTitre(),
                defi.getPoints()
        );
        return Response
                .status(Response.Status.CREATED)
                .build();
    }

    @GET
    @Path("/{id}")
    @Authenticated
    public Response getDefiById(@PathParam("id") Long id) {
        DefiDetailsResponse defi = defiService.getDefiDetails(id);
        return Response.ok(defi).build();
    }

    @GET
    @Path("/all")
    @Authenticated
    public Response getAllDefis() {
        return Response.ok(defiService.getAllDefis()).build();
    }
}

