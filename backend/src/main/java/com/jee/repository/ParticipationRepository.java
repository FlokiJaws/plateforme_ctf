package com.jee.repository;

import com.jee.entity.ParticipationSoloCtf;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.util.List;

@ApplicationScoped
public class ParticipationRepository {

    @Inject
    EntityManager em;

    public void persist(ParticipationSoloCtf participationSoloCtf) {
        em.persist(participationSoloCtf);
    }

    public ParticipationSoloCtf findActiveParticipationByParticipantAndCtf(Long ctfId, String participantEmail) {
        return em.createQuery("""
            SELECT pc FROM ParticipationSoloCtf pc WHERE pc.participant.email = :email AND pc.ctf.id = :ctfId
            AND pc.leftAt IS NULL AND pc.completedAt IS NULL""", ParticipationSoloCtf.class)
                .setParameter("email", participantEmail)
                .setParameter("ctfId", ctfId)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    public boolean hasParticipantCompletedCtf(Long ctfId, String participantEmail) {
        Long count = em.createQuery("""
            SELECT COUNT(pc) FROM ParticipationSoloCtf pc WHERE pc.participant.email = :email AND pc.ctf.id = :ctfId
            AND pc.completedAt IS NOT NULL""", Long.class)
                .setParameter("email", participantEmail)
                .setParameter("ctfId", ctfId)
                .getSingleResult();
        return count != null && count > 0;
    }



    //     Trouver toutes les participations actives/inactives/toutes pour un participant donné
    public List<ParticipationSoloCtf> findActiveParticipationsByParticipantEmail(String participantEmail) {
        return em.createQuery("""
            SELECT pc FROM ParticipationSoloCtf pc WHERE pc.participant.email = :email
            AND pc.leftAt IS NULL AND pc.completedAt IS NULL""", ParticipationSoloCtf.class)
                .setParameter("email", participantEmail)
                .getResultList();
    }

    public List<ParticipationSoloCtf> findInactiveParticipationsByParticipantEmail(String participantEmail) {
        return em.createQuery("""
            SELECT pc FROM ParticipationSoloCtf pc WHERE pc.participant.email = :email
            AND (pc.leftAt IS NOT NULL OR pc.completedAt IS NOT NULL)""", ParticipationSoloCtf.class)
                .setParameter("email", participantEmail)
                .getResultList();
    }

    public List<ParticipationSoloCtf> findAllParticipationsByParticipantEmail(String participantEmail) {
        return em.createQuery("""
            SELECT pc FROM ParticipationSoloCtf pc WHERE pc.participant.email = :email""", ParticipationSoloCtf.class)
                .setParameter("email", participantEmail)
                .getResultList();
    }


    //    Trouver toutes les participations actives/inactives/toutes pour un ctf donné

    public List<ParticipationSoloCtf> findActiveParticipationsByCtfId(Long ctfId) {
        return em.createQuery("""
            SELECT pc FROM ParticipationSoloCtf pc WHERE pc.ctf.id = :ctfId
            AND pc.leftAt IS NULL AND pc.completedAt IS NULL""", ParticipationSoloCtf.class)
                .setParameter("ctfId", ctfId)
                .getResultList();
    }

    public List<ParticipationSoloCtf> findInactiveParticipationsByCtfId(Long ctfId) {
        return em.createQuery("""
                        SELECT pc FROM ParticipationSoloCtf pc WHERE pc.ctf.id = :ctfId
            AND (pc.leftAt IS NOT NULL OR pc.completedAt IS NOT NULL)""", ParticipationSoloCtf.class)
                .setParameter("ctfId", ctfId)
                .getResultList();
    }

    public List<ParticipationSoloCtf> findAllParticipationsByCtfId(Long ctfId) {
        return em.createQuery("""
            SELECT pc FROM ParticipationSoloCtf pc WHERE pc.ctf.id = :ctfId""", ParticipationSoloCtf.class)
                .setParameter("ctfId", ctfId)
                .getResultList();
    }



}
