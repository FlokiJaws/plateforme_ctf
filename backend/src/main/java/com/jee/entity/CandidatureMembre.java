package com.jee.entity;

import com.jee.entity.enums.StatutCandidature;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "equipe_candidature")
public class CandidatureMembre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "equipe_id")
    private Equipe equipe;

    @ManyToOne(optional = false)
    @JoinColumn(name = "participant_email")
    private Participant participant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCandidature statut;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant decidedAt; // ACCEPTE, REFUSE
    private Instant endedAt; // QUITTE, EXCLU

    @ManyToOne
    @JoinColumn(name = "decided_by_email")
    private Participant decidedBy; // ACCEPTE, REFUSE

    @ManyToOne
    @JoinColumn(name = "ended_by_email")
    private Participant endedBy; // EXCLU

    public CandidatureMembre() {
    }

    public CandidatureMembre(Equipe equipe, Participant participant) {
        this.equipe = equipe;
        this.participant = participant;
        this.statut = StatutCandidature.EN_ATTENTE;
        this.createdAt = Instant.now();
    } // Constructeur pour une demande normale

    public static CandidatureMembre createChefEquipe(Equipe equipe, Participant chef) {
        CandidatureMembre candidature = new CandidatureMembre(equipe, chef);
        candidature.equipe = equipe;
        candidature.participant = chef;
        candidature.statut = StatutCandidature.ACCEPTE;
        candidature.createdAt = Instant.now();
        candidature.decidedBy = chef;
        candidature.decidedAt = Instant.now();
        return candidature;
    } // Constructeur pour le chef d'équipe


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setEquipe(Equipe equipe) {
        this.equipe = equipe;
    }

    public void setParticipant(Participant participant) {
        this.participant = participant;
    }

    public void setStatut(StatutCandidature statut) {
        this.statut = statut;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public void setDecidedAt(Instant decidedAt) {
        this.decidedAt = decidedAt;
    }

    public void setEndedAt(Instant endedAt) {
        this.endedAt = endedAt;
    }

    public void setDecidedBy(Participant decidedBy) {
        this.decidedBy = decidedBy;
    }

    public void setEndedBy(Participant endedBy) {
        this.endedBy = endedBy;
    }

    public Equipe getEquipe() {
        return equipe;
    }

    public Participant getParticipant() {
        return participant;
    }

    public StatutCandidature getStatut() {
        return statut;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getDecidedAt() {
        return decidedAt;
    }

    public Instant getEndedAt() {
        return endedAt;
    }

    public Participant getDecidedBy() {
        return decidedBy;
    }

    public Participant getEndedBy() {
        return endedBy;
    }
}
