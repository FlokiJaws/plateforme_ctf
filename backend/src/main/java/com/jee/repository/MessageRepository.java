package com.jee.repository;

import com.jee.entity.Message;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.util.List;

@ApplicationScoped
public class MessageRepository {

    @Inject
    EntityManager em;

    public void persist(Message message) {
        em.persist(message);
    }

    public Message findById(Long id) {
        return em.createQuery("SELECT m FROM Message m WHERE m.id = :id", Message.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    public List<Message> findAllMessagesByConversationId(Long conversationId) {
        return em.createQuery(
                        "SELECT m FROM Message m WHERE m.conversation.id = :conversationId ORDER BY m.sentAt ASC",
                        Message.class)
                .setParameter("conversationId", conversationId)
                .getResultList();
    }

    public int countUnreadMessagesByConversationAndRecipient(Long conversationId, String recipientEmail) {
        Long count = em.createQuery(
                        "SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId " +
                        "AND m.sender.email != :recipientEmail AND m.isRead = false",
                        Long.class)
                .setParameter("conversationId", conversationId)
                .setParameter("recipientEmail", recipientEmail)
                .getSingleResult();
        return count.intValue();
    }

    public void markMessagesAsReadByRecipient(Long conversationId, String recipientEmail) {
        em.createQuery(
                        "UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId " +
                        "AND m.sender.email != :recipientEmail AND m.isRead = false")
                .setParameter("conversationId", conversationId)
                .setParameter("recipientEmail", recipientEmail)
                .executeUpdate();
    }
}