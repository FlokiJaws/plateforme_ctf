package com.jee.repository;

import com.jee.entity.CommentaireCtf;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.util.List;

@ApplicationScoped
public class CommentsRepository {

    @Inject
    EntityManager em;

    public void persist(CommentaireCtf commentaireCtf) {
        em.persist(commentaireCtf);
    }

    public List<CommentaireCtf> findAllByCtfId(Long ctfId) {
        return em.createQuery("SELECT cc FROM CommentaireCtf cc WHERE cc.ctf.id = :ctfId", CommentaireCtf.class)
                .setParameter("ctfId", ctfId)
                .getResultList();
    }

    public List<CommentaireCtf> findAllByUserEmail(String userEmail) {
        return em.createQuery("SELECT cc FROM CommentaireCtf cc WHERE cc.user.email = :userEmail", CommentaireCtf.class)
                .setParameter("userEmail", userEmail)
                .getResultList();
    }


}
