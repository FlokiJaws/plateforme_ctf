package com.jee.DTO.messaging;

import java.time.Instant;

public class MessageResponse {
    public Long id;
    public String senderEmail;
    public String senderPseudo;
    public String content;
    public Instant sentAt;
    public boolean isRead;
}