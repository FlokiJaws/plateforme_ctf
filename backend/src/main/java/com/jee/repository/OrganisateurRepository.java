package com.jee.repository;

import com.jee.entity.Organisateur;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@ApplicationScoped
public class OrganisateurRepository {

    @PersistenceContext
    EntityManager em;

    public boolean existsByEmail(String email) {
        Organisateur organisateur = em.find(Organisateur.class, email.trim());
        return organisateur != null;
    }


    public Organisateur getReference(String email) {
        return em.getReference(Organisateur.class, email.trim());
    }
}
