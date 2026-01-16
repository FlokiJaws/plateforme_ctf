package com.jee.repository;

import com.jee.DTO.user.ParticipantInfoPublicResponse;
import com.jee.entity.CandidatureMembre;
import com.jee.entity.Equipe;
import com.jee.entity.Participant;
import com.jee.entity.enums.StatutCandidature;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.util.List;


@ApplicationScoped
public class CandidatureRepository {
    @Inject
    EntityManager em;

    public void persist(CandidatureMembre candidature){
        em.persist(candidature);
    }


    public CandidatureMembre findAcceptedCandidatureByEquipeIdAndParticipantEmail(Long equipeId, String participantEmail) {
        String query = "SELECT c FROM CandidatureMembre c WHERE c.equipe.id = :equipeId " +
                "AND c.participant.email = :participantEmail " +
                "AND c.statut = 'ACCEPTE'";

        return em.createQuery(query, CandidatureMembre.class)
                .setParameter("equipeId", equipeId)
                .setParameter("participantEmail", participantEmail)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    public CandidatureMembre findPendingCandidatureByEquipeIdAndParticipantEmail(Long equipeId, String participantEmail) {
        String query = "SELECT c FROM CandidatureMembre c WHERE c.equipe.id = :equipeId " +
                "AND c.participant.email = :participantEmail " +
                "AND c.statut = 'EN_ATTENTE'";

        return em.createQuery(query, CandidatureMembre.class)
                .setParameter("equipeId", equipeId)
                .setParameter("participantEmail", participantEmail)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    public CandidatureMembre findAcceptedCondidatureByParticipantEmail(String participantEmail) {
        String query = "SELECT c FROM CandidatureMembre c WHERE c.participant.email = :participantEmail " +
                "AND c.statut = 'ACCEPTE'";

        return em.createQuery(query, CandidatureMembre.class)
                .setParameter("participantEmail", participantEmail)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    public List<CandidatureMembre> findAcceptedCandidaturesByEquipeId(Long equipeId) {
        String query = "SELECT c FROM CandidatureMembre c WHERE c.equipe.id = :equipeId " +
                "AND c.statut = 'ACCEPTE'";

        return em.createQuery(query, CandidatureMembre.class)
                .setParameter("equipeId", equipeId)
                .getResultList();
    }

    public CandidatureMembre findCandidatureById(Long candidatureId) {
        return em.createQuery("SELECT c FROM CandidatureMembre c WHERE c.id = :candidatureId", CandidatureMembre.class)
                .setParameter("candidatureId", candidatureId)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }



    public List<CandidatureMembre> findCandidaturesByEquipeIdAndStatutCandidature(Long equipeId,
                                                                                  StatutCandidature statutCandidature) {
        String query = """
        SELECT c
        FROM CandidatureMembre c
        JOIN FETCH c.participant p
        LEFT JOIN FETCH c.decidedBy db
        LEFT JOIN FETCH c.endedBy eb
        WHERE c.equipe.id = :equipeId
          AND c.statut = :statut
    """;

        return em.createQuery(query, CandidatureMembre.class)
                .setParameter("equipeId", equipeId)
                .setParameter("statut", statutCandidature)
                .getResultList();
    }

}
