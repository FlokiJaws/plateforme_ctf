package com.jee.DTO.messaging;

import java.time.Instant;

public class ConversationListResponse {
    public Long conversationId;
    public String otherUserEmail;
    public String otherUserPseudo;
    public String otherUserRole;
    public Instant lastMessageAt;
    public int unreadCount;
}