package com.jee.DTO.equipe;

import com.jee.DTO.user.UserPublicDetails;

import java.util.List;

public class EquipeDetailsResponse {
    public Long equipeId;
    public String nomEquipe;
    public String chefEquipeEmail;
    public List<UserPublicDetails> participants;
}
