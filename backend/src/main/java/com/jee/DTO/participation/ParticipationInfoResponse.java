package com.jee.DTO.participation;

import java.time.Instant;

public class ParticipationInfoResponse {
    public Long ctfId;
    public String ctfTitre;
    public String ctfDescription;
    public String ctfLieu;
    public String participantPseudo;
    public String participantEmail;
    public Instant joinedAt;
    public Instant leftAt;
    public Instant completedAt;


}
