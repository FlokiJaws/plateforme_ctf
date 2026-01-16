package com.jee.repository;

import com.jee.entity.CTF;
import com.jee.entity.enums.CtfStatut;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.util.List;

@ApplicationScoped
public class CtfRepository {

    @Inject
    EntityManager em;

    public void persist(CTF ctf) {
        em.persist(ctf);
    }

    public CTF findById(Long id) {
        return em.createQuery("SELECT c FROM CTF c WHERE c.id = :id", CTF.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    public List<CTF> findAllByStatut(CtfStatut statut) {
        return em.createQuery("SELECT c FROM CTF c WHERE c.statut = :statut", CTF.class)
                .setParameter("statut", statut)
                .getResultList();
    }
}
