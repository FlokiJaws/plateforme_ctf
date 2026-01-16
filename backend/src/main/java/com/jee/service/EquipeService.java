package com.jee.service;

import com.jee.DTO.equipe.EquipeCandidatureDetails;
import com.jee.DTO.equipe.EquipeDetailsResponse;
import com.jee.DTO.equipe.EquipeListResponse;
import com.jee.DTO.user.UserPublicDetails;
import com.jee.entity.CandidatureMembre;
import com.jee.entity.Equipe;
import com.jee.entity.Participant;
import com.jee.entity.enums.StatutCandidature;
import com.jee.exceptionHandler.ApiException;
import com.jee.repository.CandidatureRepository;
import com.jee.repository.EquipeRepository;
import com.jee.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class EquipeService {
    @Inject
    EquipeRepository equipeRepository;
    @Inject
    UserRepository userRepository;
    @Inject
    CandidatureRepository candidatureRepository;

    @Transactional
    public void createEquipe(String nomEquipe, String emailChefEquipe) {
        Participant chefEquipe = userRepository.findParticipantByEmail(emailChefEquipe);

        if (chefEquipe == null) {
            throw new ApiException(404, "PARTICIPANT_NOT_FOUND", "Participant introuvable avec l'email : " + emailChefEquipe);
        }

        if (nomEquipe == null || nomEquipe.isBlank()) {
            throw new ApiException(400, "INVALID_EQUIPENAME", "Le nom de l'équipe ne peut pas être vide.");
        }
        if (equipeRepository.existsByNomEquipe(nomEquipe)) {
            throw new ApiException(409, "EQUIPENAME_ALREADY_EXISTS", "Le nom de l'équipe existe déjà : " + nomEquipe);
        }
        if (candidatureRepository.findAcceptedCondidatureByParticipantEmail(emailChefEquipe) != null) {
            throw new ApiException(409, "ALREADY_IN_EQUIP", "Le participant fait déjà partie d'une équipe.");
        }

        Equipe equipe = new Equipe();
        equipe.setNom(nomEquipe);
        equipe.setChef_equipe(chefEquipe);

        equipeRepository.persist(equipe);

        CandidatureMembre chefCandidature = CandidatureMembre.createChefEquipe(equipe, chefEquipe);
        candidatureRepository.persist(chefCandidature);

    }

    @Transactional
    public void requestToJoinEquipe(Long equipeId, String participantEmail) {
        Participant participant = userRepository.findParticipantByEmail(participantEmail);
        if (participant == null) {
            throw new ApiException(404, "PARTICIPANT_NOT_FOUND", "Participant introuvable avec l'email : " + participantEmail);
        }

        Equipe equipe = equipeRepository.findById(equipeId);
        if (equipe == null) {
            throw new ApiException(404, "EQUIPE_NOT_FOUND", "Équipe introuvable avec l'id : " + equipeId);
        }

        if (equipe.getChef_equipe().getEmail().equals(participantEmail)) {
            throw new ApiException(409, "CANNOT_JOIN_OWN_EQUIP", "Le chef d'équipe ne peut pas rejoindre sa propre équipe.");
        }

        if (candidatureRepository.findAcceptedCondidatureByParticipantEmail(participantEmail) != null) {
            throw new ApiException(409, "ALREADY_IN_EQUIP", "Le participant fait déjà partie d'une équipe.");
        }

        if (candidatureRepository.findPendingCandidatureByEquipeIdAndParticipantEmail(equipeId, participantEmail) != null) {
            throw new ApiException(409, "PENDING_CANDIDATURE_EXISTS", "Une candidature en attente existe déjà pour ce participant dans cette équipe.");
        }


        CandidatureMembre candidatureMembre =
                new CandidatureMembre(equipe, participant);

        candidatureRepository.persist(candidatureMembre);

    }

    @Transactional
    public void leaveEquipe(Long equipeId, String participantEmail) {

        Participant participant = userRepository.findParticipantByEmail(participantEmail);
        if (participant == null) {
            throw new ApiException(404, "PARTICIPANT_NOT_FOUND", "Participant introuvable avec l'email : " + participantEmail);
        }
        Equipe equipe = equipeRepository.findById(equipeId);
        if (equipe == null) {
            throw new ApiException(404, "EQUIPE_NOT_FOUND", "Équipe introuvable avec l'id : " + equipeId);
        }
        CandidatureMembre candidature = candidatureRepository.findAcceptedCandidatureByEquipeIdAndParticipantEmail(equipeId, participantEmail);
        if (candidature == null) {
            throw new ApiException(409, "NOT_IN_EQUIPE", "Le participant ne fait pas partie de cette équipe.");
        }

        if (equipe.getChef_equipe().getEmail().equals(participantEmail)) {
            throw new ApiException(409, "CHEF_CANNOT_LEAVE", "Le chef d'équipe ne peut pas quitter l'équipe. Veuillez désigner un nouveau chef d'équipe avant de quitter.");
        }

        candidature.setStatut(StatutCandidature.QUITTE);
        candidature.setEndedAt(Instant.now());
    }

    @Transactional
    public void kick(Long equipeId, String participantEmail, String kickedByEmail) {
        Participant participant = userRepository.findParticipantByEmail(participantEmail);
        if (participant == null) {
            throw new ApiException(404, "PARTICIPANT_NOT_FOUND", "Participant introuvable avec l'email : " + participantEmail);
        }
        Equipe equipe = equipeRepository.findById(equipeId);
        if (equipe == null) {
            throw new ApiException(404, "EQUIPE_NOT_FOUND", "Équipe introuvable avec l'id : " + equipeId);
        }
        CandidatureMembre candidature = candidatureRepository.findAcceptedCandidatureByEquipeIdAndParticipantEmail(equipeId, participantEmail);
        if (candidature == null) {
            throw new ApiException(409, "NOT_IN_EQUIPE", "Le participant ne fait pas partie de cette équipe.");
        }

        if (!equipeRepository.isChefEquipe(equipeId, kickedByEmail)) {
            throw new ApiException(403, "FORBIDDEN", "Seul le chef d'équipe peut exclure un membre.");
        }

        if (equipe.getChef_equipe().getEmail().equals(participantEmail)) {
            throw new ApiException(409, "CHEF_CANNOT_BE_KICKED", "Le chef d'équipe ne peut pas être exclu de l'équipe.");
        }

        Participant kickedBy = userRepository.findParticipantByEmail(kickedByEmail);
        candidature.setStatut(StatutCandidature.EXCLU);
        candidature.setEndedAt(Instant.now());
        candidature.setEndedBy(kickedBy);
    }

    @Transactional
    public void respondToRequest(Long requestId, boolean accept, String decidedByEmail) {
        CandidatureMembre candidature = candidatureRepository.findCandidatureById(requestId);

        if (candidature == null) {
            throw new ApiException(404, "CANDIDATURE_NOT_FOUND", "Candidature introuvable avec l'id : " + requestId);
        } // Pas de candidature retrouvee

        if (candidature.getStatut() != StatutCandidature.EN_ATTENTE) {
            throw new ApiException(409, "CANDIDATURE_ALREADY_RESPONDED", "La candidature a déjà été traitée.");
        } // Candidature deja traitee

        Participant decidedBy = userRepository.findParticipantByEmail(decidedByEmail);
        if (decidedBy == null) {
            throw new ApiException(404, "PARTICIPANT_NOT_FOUND", "Participant introuvable avec l'email : " + decidedByEmail);
        }

        if (!equipeRepository.isChefEquipe(candidature.getEquipe().getId(), decidedByEmail)) {
            throw new ApiException(403, "FORBIDDEN", "Seul le chef d'équipe peut répondre aux demandes.");
        } // L'utilisateur n'est pas le chef d'equipe

        if (accept) {
            candidature.setStatut(StatutCandidature.ACCEPTE);
        } else {
            candidature.setStatut(StatutCandidature.REFUSE);
        }
        candidature.setDecidedBy(decidedBy);
        candidature.setDecidedAt(Instant.now());
    }

    @Transactional
    public void changeChefEquipe(String oldChefEmail, String newChefEmail, Long equipeId) {

        Equipe equipe = equipeRepository.findById(equipeId);
        if (equipe == null) {
            throw new ApiException(404, "EQUIPE_NOT_FOUND", "Équipe introuvable avec l'id : " + equipeId);
        }
        if (!equipe.getChef_equipe().getEmail().equals(oldChefEmail)) {
            throw new ApiException(403, "FORBIDDEN", "Seul le chef d'équipe peut désigner un nouveau chef d'équipe");
        }
        if (oldChefEmail.equals(newChefEmail)) {
            throw new ApiException(409, "SAME_CHEF", "Le nouveau chef doit être différent de l'ancien.");
        }
        Participant newChef = userRepository.findParticipantByEmail(newChefEmail);
        if (newChef == null) {
            throw new ApiException(404, "PARTICIPANT_NOT_FOUND", "Participant introuvable avec l'email : " + newChefEmail);
        }
        if (candidatureRepository.findAcceptedCandidatureByEquipeIdAndParticipantEmail(equipeId, newChefEmail) == null) {
            throw new ApiException(409, "NOT_IN_EQUIP", "Le nouveau chef d'équipe doit être membre de l'équipe.");
        }

        equipe.setChef_equipe(newChef);
    }

    @Transactional
    public List<EquipeListResponse> getAllEquipes() {
        List<Equipe> equipes = equipeRepository.findAllEquipes();
        return equipes.stream().map(equipe -> {
            EquipeListResponse response = new EquipeListResponse();
            response.equipeId = equipe.getId();
            response.nomEquipe = equipe.getNom();
            response.chefEquipeEmail = equipe.getChef_equipe().getEmail();
            response.nombreMembres = equipeRepository.countActiveMembresInEquipe(equipe.getId());
            return response;
        }).toList();
    }

    @Transactional
    public EquipeDetailsResponse getEquipeDetails(Long equipeId) {
        Equipe equipe = equipeRepository.findById(equipeId);
        if (equipe == null) {
            throw new ApiException(404, "EQUIPE_NOT_FOUND", "Équipe introuvable avec l'id : " + equipeId);
        }

        List<CandidatureMembre> acceptedCandidatures = candidatureRepository.findAcceptedCandidaturesByEquipeId(equipeId);

        EquipeDetailsResponse response = new EquipeDetailsResponse();

        response.equipeId = equipe.getId();
        response.nomEquipe = equipe.getNom();
        response.chefEquipeEmail = equipe.getChef_equipe().getEmail();
        response.participants = new ArrayList<>();

        for (CandidatureMembre candidature : acceptedCandidatures) {
            Participant participant = candidature.getParticipant();
            UserPublicDetails participantInfo = new UserPublicDetails();
            participantInfo.email = participant.getEmail();
            participantInfo.pseudo = participant.getPseudo();
            response.participants.add(participantInfo);
        }

        return response;
    }

    @Transactional
    public List<EquipeCandidatureDetails> getEquipeMembersDetails(Long equipeId, StatutCandidature statut, String requesterEmail, boolean isAdmin) {

        if (statut == null) {
            throw new ApiException(400, "MISSING_STATUT", "Le param candidature_statut est requis.");
        }

        Equipe equipe = equipeRepository.findById(equipeId);
        if (equipe == null) {
            throw new ApiException(404, "EQUIPE_NOT_FOUND", "Équipe introuvable avec l'id : " + equipeId);
        }

        if (!isAdmin && !equipeRepository.isChefEquipe(equipeId, requesterEmail)) {
            throw new ApiException(403, "FORBIDDEN", "Seul le chef d'équipe ou un administrateur peut voir les membres de l'équipe.");
        }

        List<CandidatureMembre> candidatures =
                candidatureRepository.findCandidaturesByEquipeIdAndStatutCandidature(equipeId, statut); // idéalement JOIN FETCH

        List<EquipeCandidatureDetails> responseList = new ArrayList<>(candidatures.size());

        for (CandidatureMembre c : candidatures) {
            EquipeCandidatureDetails d = new EquipeCandidatureDetails();
            d.candidatureId = c.getId();
            d.equipeId = equipe.getId();
            d.equipeNom = equipe.getNom();
            d.chefEquipeEmail = (equipe.getChef_equipe() != null) ? equipe.getChef_equipe().getEmail() : null;

            d.participantEmail = c.getParticipant().getEmail();
            d.participantPseudo = c.getParticipant().getPseudo();

            d.statut = c.getStatut();
            d.createdAt = c.getCreatedAt();
            d.decidedAt = c.getDecidedAt();
            d.endedAt = c.getEndedAt();
            d.decidedByEmail = (c.getDecidedBy() != null) ? c.getDecidedBy().getEmail() : null;
            d.endedByEmail = (c.getEndedBy() != null) ? c.getEndedBy().getEmail() : null;

            responseList.add(d);
        }

        return responseList;
    }
}
