package com.jee.repository;

import com.jee.entity.Discussion;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.util.List;

@ApplicationScoped
public class ConversationRepository {

    @Inject
    EntityManager em;

    public void persist(Discussion discussion) {
        em.persist(discussion);
    }

    public Discussion findById(Long id) {
        return em.createQuery("SELECT c FROM Discussion c WHERE c.id = :id", Discussion.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    public Discussion findConversationBetweenUsers(String email1, String email2) {
        // On s'assure que email1 < email2 pour la recherche
        String smallerEmail = email1.compareTo(email2) < 0 ? email1 : email2;
        String largerEmail = email1.compareTo(email2) < 0 ? email2 : email1;

        return em.createQuery(
                        "SELECT c FROM Discussion c WHERE c.user1.email = :email1 AND c.user2.email = :email2",
                        Discussion.class)
                .setParameter("email1", smallerEmail)
                .setParameter("email2", largerEmail)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    public List<Discussion> findAllConversationsByUserEmail(String userEmail) {
        return em.createQuery(
                        "SELECT c FROM Discussion c WHERE c.user1.email = :email OR c.user2.email = :email ORDER BY c.lastMessageAt DESC",
                        Discussion.class)
                .setParameter("email", userEmail)
                .getResultList();
    }
}