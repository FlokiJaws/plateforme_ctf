package com.jee.controller;

import com.jee.DTO.user.BanUserRequest;
import com.jee.service.UserService;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/users")
@Consumes(MediaType.APPLICATION_JSON)
public class UserController {

    @Inject
    UserService userService;

    @POST
    @Path("/ban")
    @RolesAllowed("ADMINISTRATEUR")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response banUser(BanUserRequest body) {
        userService.banUser(body.userEmail, body.banReason);
        return Response.status(200).build();
    }

    @GET
    @Path("/getall/admin")
    @RolesAllowed("ADMINISTRATEUR")
    public Response getAllUsersForAdmin() {
        return Response.ok(userService.getAllUsersForAdmin()).build();
    }

    @GET
    @Path("/getall/participants")
    @Authenticated
    public Response getAllUsersForPublic() {
        return Response.ok(userService.getAllUsersForPublic()).build();
    }

    @GET
    @Path("/getall/organisateurs")
    @Authenticated
    public Response getAllOrganisateurs() {
        return Response.ok(userService.getAllOrganisateurs()).build();
    }



}
