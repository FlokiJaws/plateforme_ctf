package com.jee.DTO.equipe;

import com.jee.entity.enums.StatutCandidature;

import java.time.Instant;

public class EquipeCandidatureDetails {
    public Long candidatureId;
    public Long equipeId;
    public String equipeNom;
    public String chefEquipeEmail;
    public String participantEmail;
    public String participantPseudo;
    public StatutCandidature statut;
    public Instant createdAt;
    public Instant decidedAt;
    public Instant endedAt;
    public String decidedByEmail;
    public String endedByEmail;
}
