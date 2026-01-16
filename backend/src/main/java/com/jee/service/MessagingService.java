package com.jee.service;

import com.jee.DTO.messaging.*;
import com.jee.entity.Discussion;
import com.jee.entity.Message;
import com.jee.entity.User;
import com.jee.entity.enums.Role;
import com.jee.exceptionHandler.ApiException;
import com.jee.repository.ConversationRepository;
import com.jee.repository.MessageRepository;
import com.jee.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class MessagingService {

    @Inject
    ConversationRepository conversationRepository;

    @Inject
    MessageRepository messageRepository;

    @Inject
    UserRepository userRepository;

    // ve
    private void validateCanContact(User sender, User recipient) {
        if (sender.getEmail().equals(recipient.getEmail())) {
            throw new ApiException(400, "CANNOT_MESSAGE_SELF", "Vous ne pouvez pas vous envoyer un message à vous-même.");
        }

        Role senderRole = sender.getRole();
        Role recipientRole = recipient.getRole();

        // ADMINISTRATEUR peut contacter tout le monde
        if (senderRole == Role.ADMINISTRATEUR) {
            return;
        }

        // PARTICIPANT peut contacter ORGANISATEUR et PARTICIPANT
        if (senderRole == Role.PARTICIPANT) {
            if (recipientRole == Role.ORGANISATEUR || recipientRole == Role.PARTICIPANT) {
                return;
            }
            throw new ApiException(403, "CONTACT_NOT_ALLOWED",
                    "Un participant ne peut contacter que des organisateurs et d'autres participants.");
        }

        // ORGANISATEUR peut contacter PARTICIPANT et ORGANISATEUR
        if (senderRole == Role.ORGANISATEUR) {
            if (recipientRole == Role.PARTICIPANT || recipientRole == Role.ORGANISATEUR) {
                return;
            }
            throw new ApiException(403, "CONTACT_NOT_ALLOWED",
                    "Un organisateur ne peut contacter que des participants et d'autres organisateurs.");
        }

        throw new ApiException(403, "CONTACT_NOT_ALLOWED", "Vous n'êtes pas autorisé à contacter cet utilisateur.");
    }

    @Transactional
    public Long startConversation(String senderEmail, String recipientEmail) {
        User sender = userRepository.findUserByEmail(senderEmail);
        if (sender == null) {
            throw new ApiException(404, "USER_NOT_FOUND", "Utilisateur introuvable: " + senderEmail);
        }

        User recipient = userRepository.findUserByEmail(recipientEmail);
        if (recipient == null) {
            throw new ApiException(404, "USER_NOT_FOUND", "Destinataire introuvable: " + recipientEmail);
        }

        if (sender.getBanned() || recipient.getBanned()) {
            throw new ApiException(403, "USER_BANNED", "Impossible de démarrer une conversation avec un utilisateur banni.");
        }

        // Vérifier les permissions
        validateCanContact(sender, recipient);

        // Vérifier si une conversation existe déjà
        Discussion existingDiscussion = conversationRepository.findConversationBetweenUsers(senderEmail, recipientEmail);
        if (existingDiscussion != null) {
            return existingDiscussion.getId();
        }

        // Créer nouvelle conversation
        Discussion discussion = new Discussion(sender, recipient);
        conversationRepository.persist(discussion);

        return discussion.getId();
    }

    @Transactional
    public MessageResponse sendMessage(Long conversationId, String senderEmail, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new ApiException(400, "EMPTY_MESSAGE", "Le message ne peut pas être vide.");
        }

        if (content.length() > 5000) {
            throw new ApiException(400, "MESSAGE_TOO_LONG", "Le message ne peut pas dépasser 5000 caractères.");
        }

        Discussion discussion = conversationRepository.findById(conversationId);
        if (discussion == null) {
            throw new ApiException(404, "CONVERSATION_NOT_FOUND", "Conversation introuvable: " + conversationId);
        }

        User sender = userRepository.findUserByEmail(senderEmail);
        if (sender == null) {
            throw new ApiException(404, "USER_NOT_FOUND", "Utilisateur introuvable: " + senderEmail);
        }

        // Vérifier que l'expéditeur fait partie de la conversation
        if (!discussion.getUser1().getEmail().equals(senderEmail)
            && !discussion.getUser2().getEmail().equals(senderEmail)) {
            throw new ApiException(403, "NOT_CONVERSATION_MEMBER",
                    "Vous ne faites pas partie de cette conversation.");
        }

        // Créer le message
        Message message = new Message();
        message.setConversation(discussion);
        message.setSender(sender);
        message.setContent(content.trim());
        message.setSentAt(Instant.now());
        message.setRead(false);

        messageRepository.persist(message);

        // Mettre à jour lastMessageAt de la conversation
        discussion.setLastMessageAt(Instant.now());

        // Préparer la réponse
        MessageResponse response = new MessageResponse();
        response.id = message.getId();
        response.senderEmail = sender.getEmail();
        response.senderPseudo = sender.getPseudo();
        response.content = message.getContent();
        response.sentAt = message.getSentAt();
        response.isRead = message.isRead();

        return response;
    }

    public List<ConversationListResponse> getMyConversations(String userEmail) {
        User user = userRepository.findUserByEmail(userEmail);
        if (user == null) {
            throw new ApiException(404, "USER_NOT_FOUND", "Utilisateur introuvable: " + userEmail);
        }

        List<Discussion> discussions = conversationRepository.findAllConversationsByUserEmail(userEmail);
        List<ConversationListResponse> responses = new ArrayList<>();

        for (Discussion discussion : discussions) {
            User otherUser = discussion.getOtherUser(userEmail);

            ConversationListResponse response = new ConversationListResponse();
            response.conversationId = discussion.getId();
            response.otherUserEmail = otherUser.getEmail();
            response.otherUserPseudo = otherUser.getPseudo();
            response.otherUserRole = otherUser.getRole().name();
            response.lastMessageAt = discussion.getLastMessageAt();
            response.unreadCount = messageRepository.countUnreadMessagesByConversationAndRecipient(
                    discussion.getId(), userEmail);

            responses.add(response);
        }

        return responses;
    }

    @Transactional
    public ConversationDetailsResponse getConversationDetails(Long conversationId, String userEmail) {
        Discussion discussion = conversationRepository.findById(conversationId);
        if (discussion == null) {
            throw new ApiException(404, "CONVERSATION_NOT_FOUND", "Conversation introuvable: " + conversationId);
        }

        // Vérifier que l'utilisateur fait partie de la conversation
        if (!discussion.getUser1().getEmail().equals(userEmail)
            && !discussion.getUser2().getEmail().equals(userEmail)) {
            throw new ApiException(403, "NOT_CONVERSATION_MEMBER",
                    "Vous ne faites pas partie de cette conversation.");
        }

        User otherUser = discussion.getOtherUser(userEmail);

        // Marquer les messages comme lus
        messageRepository.markMessagesAsReadByRecipient(conversationId, userEmail);

        // Récupérer tous les messages
        List<Message> messages = messageRepository.findAllMessagesByConversationId(conversationId);
        List<MessageResponse> messageResponses = new ArrayList<>();

        for (Message message : messages) {
            MessageResponse messageResponse = new MessageResponse();
            messageResponse.id = message.getId();
            messageResponse.senderEmail = message.getSender().getEmail();
            messageResponse.senderPseudo = message.getSender().getPseudo();
            messageResponse.content = message.getContent();
            messageResponse.sentAt = message.getSentAt();
            messageResponse.isRead = message.isRead();
            messageResponses.add(messageResponse);
        }

        ConversationDetailsResponse response = new ConversationDetailsResponse();
        response.conversationId = discussion.getId();
        response.otherUserEmail = otherUser.getEmail();
        response.otherUserPseudo = otherUser.getPseudo();
        response.otherUserRole = otherUser.getRole().name();
        response.createdAt = discussion.getCreatedAt();
        response.messages = messageResponses;

        return response;
    }

    // recuperer seulement les messages d'une conversation sans les marquer comme lus
    public List<MessageResponse> getConversationMessages(Long conversationId, String userEmail) {
        Discussion discussion = conversationRepository.findById(conversationId);
        if (discussion == null) {
            throw new ApiException(404, "CONVERSATION_NOT_FOUND", "Conversation introuvable: " + conversationId);
        }

        // Vérifier que l'utilisateur fait partie de la conversation
        if (!discussion.getUser1().getEmail().equals(userEmail)
            && !discussion.getUser2().getEmail().equals(userEmail)) {
            throw new ApiException(403, "NOT_CONVERSATION_MEMBER",
                    "Vous ne faites pas partie de cette conversation.");
        }

        List<Message> messages = messageRepository.findAllMessagesByConversationId(conversationId);
        List<MessageResponse> messageResponses = new ArrayList<>();

        for (Message message : messages) {
            MessageResponse messageResponse = new MessageResponse();
            messageResponse.id = message.getId();
            messageResponse.senderEmail = message.getSender().getEmail();
            messageResponse.senderPseudo = message.getSender().getPseudo();
            messageResponse.content = message.getContent();
            messageResponse.sentAt = message.getSentAt();
            messageResponse.isRead = message.isRead();
            messageResponses.add(messageResponse);
        }

        return messageResponses;
    }

    // marquer tous les messages d'une conversation comme lus
    @Transactional
    public void markConversationAsRead(Long conversationId, String userEmail) {
        Discussion discussion = conversationRepository.findById(conversationId);
        if (discussion == null) {
            throw new ApiException(404, "CONVERSATION_NOT_FOUND", "Conversation introuvable: " + conversationId);
        }

        // Vérifier que l'utilisateur fait partie de la conversation
        if (!discussion.getUser1().getEmail().equals(userEmail)
            && !discussion.getUser2().getEmail().equals(userEmail)) {
            throw new ApiException(403, "NOT_CONVERSATION_MEMBER",
                    "Vous ne faites pas partie de cette conversation.");
        }

        messageRepository.markMessagesAsReadByRecipient(conversationId, userEmail);
    }

    // compter le nombre total de messages non lus pour un utilisateur
    public int getTotalUnreadCount(String userEmail) {
        User user = userRepository.findUserByEmail(userEmail);
        if (user == null) {
            throw new ApiException(404, "USER_NOT_FOUND", "Utilisateur introuvable: " + userEmail);
        }

        List<Discussion> discussions = conversationRepository.findAllConversationsByUserEmail(userEmail);
        int totalUnread = 0;

        for (Discussion discussion : discussions) {
            totalUnread += messageRepository.countUnreadMessagesByConversationAndRecipient(
                    discussion.getId(), userEmail);
        }

        return totalUnread;
    }

    // recuperer seulement les messages non lus d'une conversation
    public List<MessageResponse> getUnreadMessages(Long conversationId, String userEmail) {
        Discussion discussion = conversationRepository.findById(conversationId);
        if (discussion == null) {
            throw new ApiException(404, "CONVERSATION_NOT_FOUND", "Conversation introuvable: " + conversationId);
        }

        // Vérifier que l'utilisateur fait partie de la conversation
        if (!discussion.getUser1().getEmail().equals(userEmail)
            && !discussion.getUser2().getEmail().equals(userEmail)) {
            throw new ApiException(403, "NOT_CONVERSATION_MEMBER",
                    "Vous ne faites pas partie de cette conversation.");
        }

        List<Message> messages = messageRepository.findAllMessagesByConversationId(conversationId);
        List<MessageResponse> unreadMessages = new ArrayList<>();

        for (Message message : messages) {
            // Ne retourner que les messages non lus qui ne sont pas envoyés par l'utilisateur courant
            if (!message.isRead() && !message.getSender().getEmail().equals(userEmail)) {
                MessageResponse messageResponse = new MessageResponse();
                messageResponse.id = message.getId();
                messageResponse.senderEmail = message.getSender().getEmail();
                messageResponse.senderPseudo = message.getSender().getPseudo();
                messageResponse.content = message.getContent();
                messageResponse.sentAt = message.getSentAt();
                messageResponse.isRead = message.isRead();
                unreadMessages.add(messageResponse);
            }
        }

        return unreadMessages;
    }
}