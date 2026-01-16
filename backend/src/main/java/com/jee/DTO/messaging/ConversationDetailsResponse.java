package com.jee.DTO.messaging;

import java.time.Instant;
import java.util.List;

public class ConversationDetailsResponse {
    public Long conversationId;
    public String otherUserEmail;
    public String otherUserPseudo;
    public String otherUserRole;
    public Instant createdAt;
    public List<MessageResponse> messages;
}