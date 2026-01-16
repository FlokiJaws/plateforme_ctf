package com.jee.service;

import com.jee.DTO.participation.ParticipationInfoResponse;
import com.jee.entity.Participant;
import com.jee.entity.ParticipationSoloCtf;
import com.jee.entity.enums.ParticipationFilter;
import com.jee.exceptionHandler.ApiException;
import com.jee.repository.ParticipationRepository;
import com.jee.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class ParticipantService {

    @Inject
    ParticipationRepository participationRepository;
    @Inject
    UserRepository userRepository;

    public List<ParticipationInfoResponse> getParticipationsByFilter(String participantEmail, ParticipationFilter filter) {
        Participant participant = userRepository.findParticipantByEmail(participantEmail);
        if (participant == null) {
            throw new ApiException(404, "PARTICIPANT_NOT_FOUND", "Participant introuvable avec l'email : " + participantEmail);
        }

        List<ParticipationSoloCtf> participations = switch (filter) {
            case ACTIVE -> participationRepository.findActiveParticipationsByParticipantEmail(participantEmail);
            case INACTIVE -> participationRepository.findInactiveParticipationsByParticipantEmail(participantEmail);
            case ALL -> participationRepository.findAllParticipationsByParticipantEmail(participantEmail);
        };

        return participations.stream().map(participation -> {
            ParticipationInfoResponse response = new ParticipationInfoResponse();
            response.ctfId = participation.getCtf().getId();
            response.ctfTitre = participation.getCtf().getTitre();
            response.ctfDescription = participation.getCtf().getDescription();
            response.ctfLieu = participation.getCtf().getLieu();
            response.participantPseudo = participation.getParticipant().getPseudo();
            response.joinedAt = participation.getJoinedAt();
            response.leftAt = participation.getLeftAt();
            response.completedAt = participation.getCompletedAt();
            return response;
        }).toList();
    }
}
