package com.jee.controller;

import com.jee.DTO.messaging.*;
import com.jee.service.MessagingService;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/messaging")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
public class MessagingController {

    @Inject
    MessagingService messagingService;

    @Inject
    SecurityIdentity identity;

    /**
     * Démarrer une nouvelle conversation avec un utilisateur
     * POST /messaging/conversations/start
     */
    @POST
    @Path("/conversations/start")
    @Transactional
    public Response startConversation(StartConversationRequest request) {
        String currentUserEmail = identity.getPrincipal().getName();

        Long conversationId = messagingService.startConversation(
                currentUserEmail,
                request.recipientEmail
        );

        return Response.status(Response.Status.CREATED)
                .entity(new ConversationIdResponse(conversationId))
                .build();
    }

    /**
     * Obtenir toutes les conversations de l'utilisateur connecté
     * GET /messaging/conversations
     */
    @GET
    @Path("/conversations")
    public Response getMyConversations() {
        String currentUserEmail = identity.getPrincipal().getName();
        return Response.ok(messagingService.getMyConversations(currentUserEmail)).build();
    }

    /**
     * Obtenir les détails d'une conversation avec tous les messages
     * GET /messaging/conversations/{conversationId}
     */
    @GET
    @Path("/conversations/{conversationId}")
    @Transactional
    public Response getConversationDetails(@PathParam("conversationId") Long conversationId) {
        String currentUserEmail = identity.getPrincipal().getName();
        return Response.ok(
                messagingService.getConversationDetails(conversationId, currentUserEmail)
        ).build();
    }

    /**
     * Envoyer un message dans une conversation
     * POST /messaging/conversations/{conversationId}/messages
     */
    @POST
    @Path("/conversations/{conversationId}/messages")
    @Transactional
    public Response sendMessage(
            @PathParam("conversationId") Long conversationId,
            SendMessageRequest request) {
        String currentUserEmail = identity.getPrincipal().getName();

        MessageResponse response = messagingService.sendMessage(
                conversationId,
                currentUserEmail,
                request.content
        );

        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    /**
     * Récupérer seulement les messages d'une conversation (sans marquer comme lu)
     * GET /messaging/conversations/{conversationId}/messages
     */
    @GET
    @Path("/conversations/{conversationId}/messages")
    public Response getConversationMessages(@PathParam("conversationId") Long conversationId) {
        String currentUserEmail = identity.getPrincipal().getName();
        return Response.ok(
                messagingService.getConversationMessages(conversationId, currentUserEmail)
        ).build();
    }

    /**
     * Récupérer uniquement les messages non lus d'une conversation
     * GET /messaging/conversations/{conversationId}/messages/unread
     */
    @GET
    @Path("/conversations/{conversationId}/messages/unread")
    public Response getUnreadMessages(@PathParam("conversationId") Long conversationId) {
        String currentUserEmail = identity.getPrincipal().getName();
        return Response.ok(
                messagingService.getUnreadMessages(conversationId, currentUserEmail)
        ).build();
    }

    /**
     * Marquer tous les messages d'une conversation comme lus
     * POST /messaging/conversations/{conversationId}/mark-read
     */
    @POST
    @Path("/conversations/{conversationId}/mark-read")
    @Transactional
    public Response markConversationAsRead(@PathParam("conversationId") Long conversationId) {
        String currentUserEmail = identity.getPrincipal().getName();
        messagingService.markConversationAsRead(conversationId, currentUserEmail);
        return Response.noContent().build();
    }

    /**
     * Obtenir le nombre total de messages non lus
     * GET /messaging/unread-count
     */
    @GET
    @Path("/unread-count")
    public Response getTotalUnreadCount() {
        String currentUserEmail = identity.getPrincipal().getName();
        int count = messagingService.getTotalUnreadCount(currentUserEmail);
        return Response.ok(new UnreadCountResponse(count)).build();
    }

    // Classes helper pour les réponses
    public static class ConversationIdResponse {
        public Long conversationId;

        public ConversationIdResponse(Long conversationId) {
            this.conversationId = conversationId;
        }
    }

    public static class UnreadCountResponse {
        public int unreadCount;

        public UnreadCountResponse(int unreadCount) {
            this.unreadCount = unreadCount;
        }
    }
}