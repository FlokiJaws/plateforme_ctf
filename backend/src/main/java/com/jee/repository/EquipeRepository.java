package com.jee.repository;

import com.jee.entity.Equipe;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.util.List;

@ApplicationScoped
public class EquipeRepository {

    @Inject
    EntityManager em;

    public void persist(Equipe equipe) {
        em.persist(equipe);
    }

    public boolean existsByNomEquipe(String nomEquipe) {
        Long count = em.createQuery(
                        "SELECT COUNT(e) FROM Equipe e WHERE e.nom = :nomEquipe", Long.class)
                .setParameter("nomEquipe", nomEquipe)
                .getSingleResult();
        return count > 0;
    }

    public Equipe findById(Long id) {
        return em.createQuery(""" 
                        SELECT e FROM Equipe e WHERE e.id = :id""", Equipe.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    public boolean isChefEquipe(Long equipeId, String participantEmail) {
        Long count = em.createQuery(
                        "SELECT COUNT(e) FROM Equipe e WHERE e.id = :equipeId AND e.chef_equipe.email = :participantEmail", Long.class)
                .setParameter("equipeId", equipeId)
                .setParameter("participantEmail", participantEmail)
                .getSingleResult();
        return count > 0;
    }

    public List<Equipe> findAllEquipes() {
        return em.createQuery("SELECT e FROM Equipe e", Equipe.class)
                .getResultList();
    }

    public int countActiveMembresInEquipe(Long equipeId) {
        String query = "SELECT COUNT(c) FROM CandidatureMembre c WHERE c.equipe.id = :equipeId " +
                "AND c.statut = 'ACCEPTE'";

        Long count = em.createQuery(query, Long.class)
                .setParameter("equipeId", equipeId)
                .getSingleResult();

        return count.intValue();
    }
}