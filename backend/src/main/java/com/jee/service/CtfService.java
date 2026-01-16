package com.jee.service;

import com.jee.DTO.ctf.CtfCreateRequest;
import com.jee.DTO.ctf.CtfInfoResponse;
import com.jee.DTO.ctf.UpdateCtfRequest;
import com.jee.DTO.participation.ParticipationInfoResponse;
import com.jee.entity.*;
import com.jee.entity.enums.CtfStatut;
import com.jee.entity.enums.ParticipationFilter;
import com.jee.exceptionHandler.ApiException;
import com.jee.repository.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.List;

@ApplicationScoped
public class CtfService {

    @Inject
    CtfRepository ctfRepository;
    @Inject
    OrganisateurRepository organisateurRepository;
    @Inject
    UserRepository userRepository;
    @Inject
    ParticipationRepository participationRepository;
    @Inject
    EquipeRepository equipeRepository;

    @Transactional
    public void createCtf(String organisateurEmail, CtfCreateRequest request) {


        if (!organisateurRepository.existsByEmail(organisateurEmail)) {
            throw new ApiException(404, "ORGANISATEUR_NOT_FOUND", "Organisateur introuvable avec l'email : " + organisateurEmail);
        }

        Organisateur organisateur = organisateurRepository.getReference(organisateurEmail);

        CTF ctf = new CTF();
        ctf.setTitre(request.getTitre());
        ctf.setDescription(request.getDescription());
        ctf.setLieu(request.getLieu());
        ctf.setContact(organisateur);
        ctf.setNbVues(0);
        ctf.setStatut(CtfStatut.EN_ATTENTE);

        ctfRepository.persist(ctf);


    }

    @Transactional
    public CtfInfoResponse getCtfById(Long id) {
        CTF ctf = ctfRepository.findById(id);
        if (ctf == null) {
            throw new ApiException(404, "CTF_NOT_FOUND", "CTF Introuvable avec l'id : " + id);
        }

        ctf.setNbVues(ctf.getNbVues() + 1);

        CtfInfoResponse response = new CtfInfoResponse();
        response.id = ctf.getId();
        response.titre = ctf.getTitre();
        response.description = ctf.getDescription();
        response.lieu = ctf.getLieu();
        response.nbVues = ctf.getNbVues();
        response.statut = ctf.getStatut().name();
        response.organisateurPseudo = ctf.getContact().getPseudo();

        return response;

    }

    public List<CtfInfoResponse> getAllCtfsByStatut(CtfStatut statut) {

        List<CTF> ctfs = ctfRepository.findAllByStatut(statut);

        return ctfs.stream().map(ctf -> {
            CtfInfoResponse response = new CtfInfoResponse();
            response.id = ctf.getId();
            response.titre = ctf.getTitre();
            response.description = ctf.getDescription();
            response.lieu = ctf.getLieu();
            response.nbVues = ctf.getNbVues();
            response.statut = ctf.getStatut().name();
            response.organisateurPseudo = ctf.getContact().getPseudo();
            return response;
        }).toList();
    }

    @Transactional
    public void ctfValidationAdmin(Long id, boolean validate) {

        CTF ctf = ctfRepository.findById(id);

        if (ctf == null) {
            throw new ApiException(404, "CTF_NOT_FOUND", "CTF Introuvable avec l'id : " + id);
        }

        if (ctf.getStatut() != CtfStatut.EN_ATTENTE) {
            throw new ApiException(428, "CTF_NOT_PENDING", "CTF doit être en attente pour être validé ou refusé.");
        }

        if (validate) {
            ctf.setStatut(CtfStatut.ACTIF);
        } else {
            ctf.setStatut(CtfStatut.INACTIF);
        }

    }

    @Transactional
    public void disableCtf(Long id, String requesterEmail, boolean isAdmin) {
        CTF ctf = ctfRepository.findById(id);

        if (ctf == null) {
            throw new ApiException(404, "CTF_NOT_FOUND", "CTF Introuvable d'id : " + id);
        }

        if (!isAdmin) {
            // Vérifier que le demandeur est l'organisateur du CTF
            if (!ctf.getContact().getEmail().equals(requesterEmail)) {
                throw new ApiException(403, "CTF_NOT_OWNER", "Vous n'êtes pas autorisé à désactiver ce CTF.");
            }
        }

        ctf.setStatut(CtfStatut.INACTIF);
    }

    @Transactional
    public CtfInfoResponse modifyCtf(Long id, boolean isAdmin, String requesterEmail, UpdateCtfRequest request) {
        CTF ctf = ctfRepository.findById(id);

        if (ctf == null) {
            throw new ApiException(404, "CTF_NOT_FOUND", "CTF Introuvable d'id : " + id);
        }

        if (ctf.getContact() == null || ctf.getContact().getEmail() == null) {
            throw new ApiException(500, "CTF_OWNER_NOT_FOUND", "Le CTF n'a pas d'organisateur associé.");
        }

        if (!isAdmin) {

            if (ctf.getStatut() == CtfStatut.INACTIF) {
                throw new ApiException(409, "CTF_NOT_ACTIVE", "Seul un CTF actif peut être modifié.");
            } // 409 Conflict si le CTF est inactif

            // Vérifier que le demandeur est l'organisateur du CTF
            if (!ctf.getContact().getEmail().equals(requesterEmail)) {
                throw new ApiException(403, "CTF_NOT_OWNER", "Vous n'êtes pas autorisé à modifier ce CTF.");
            }
        }

        boolean changed = false;

        if (request.titre != null && !request.titre.equals(ctf.getTitre())) {
            ctf.setTitre(request.titre);
            changed = true;
        }
        if (request.description != null && !request.description.equals(ctf.getDescription())) {
            ctf.setDescription(request.description);
            changed = true;
        }
        if (request.lieu != null && !request.lieu.equals(ctf.getLieu())) {
            ctf.setLieu(request.lieu);
            changed = true;
        }

        if (!changed) {
            throw new ApiException(400, "NO_CHANGES", "Aucune modification détectée.");
        }

        if (!isAdmin) {
            ctf.setStatut(CtfStatut.EN_ATTENTE);
        }

        return getCtfById(id);
    }

    @Transactional
    public void joinCtfAsSolo(Long ctfId, String participantEmail) {

        CTF ctf = ctfRepository.findById(ctfId);
        if (ctf == null) {
            throw new ApiException(404, "CTF_NOT_FOUND", "CTF Introuvable d'id : " + ctfId);
        }
        if (ctf.getStatut() != CtfStatut.ACTIF) {
            throw new ApiException(409, "CTF_NOT_ACTIVE", "Le CTF n'est pas actif.");
        }

        Participant participant = userRepository.findParticipantByEmail(participantEmail);
        if (participant == null) {
            throw new ApiException(404, "PARTICIPANT_NOT_FOUND", "Participant introuvable avec l'email : " + participantEmail);
        }

        if (participationRepository.hasParticipantCompletedCtf(ctfId, participantEmail)) {
            throw new ApiException(409, "CTF_ALREADY_COMPLETED", "Vous avez déjà complété ce CTF.");
        }

        ParticipationSoloCtf existingParticipation = participationRepository.findActiveParticipationByParticipantAndCtf(ctfId, participantEmail);
        if (existingParticipation != null) {
            throw new ApiException(409, "CTF_ALREADY_JOINED", "Vous participez déjà à ce CTF.");
        }

        ParticipationSoloCtf participationSoloCtf = new ParticipationSoloCtf();
        participationSoloCtf.setCtf(ctf);
        participationSoloCtf.setParticipant(participant);
        participationSoloCtf.join();

        participationRepository.persist(participationSoloCtf);

    }

    // TODO : COMPLETER LA METHODE
//    @Transactional
//    public void joinCtfAsEquipe(Long ctfId, Long equipeId, String requesterEmail) {
//        CTF ctf = ctfRepository.findById(ctfId);
//        if (ctf == null) {
//            throw new ApiException(404, "CTF_NOT_FOUND", "CTF Introuvable d'id : " + ctfId);
//        }
//        if (ctf.getStatut() != CtfStatut.ACTIF) {
//            throw new ApiException(409, "CTF_NOT_ACTIVE", "Le CTF n'est pas actif.");
//        }
//        Equipe equipe = equipeRepository.findById(equipeId);
//        if (equipe == null) {
//            throw new ApiException(404, "EQUIPE_NOT_FOUND", "Équipe introuvable d'id : " + equipeId);
//        }
//        if (!equipe.getChef_equipe().getEmail().equals(requesterEmail)) {
//            throw new ApiException(403, "NOT_TEAM_LEADER", "Seul le chef d'équipe peut inscrire l'équipe à un CTF.");
//        }
//
//
//    }

    @Transactional
    public void leaveCtf(Long ctfId, String participantEmail) {

        ParticipationSoloCtf participationSoloCtf = participationRepository.findActiveParticipationByParticipantAndCtf(ctfId, participantEmail);
        if (participationSoloCtf == null) {
            throw new ApiException(404, "PARTICIPATION_NOT_FOUND", "Vous ne participez pas actuellement à ce CTF.");
        }

        participationSoloCtf.setLeftAt(Instant.now());
    }

    public List<ParticipationInfoResponse> getParticipationsByFilter(Long ctfId, ParticipationFilter filter,
                                                                     String requesterEmail, boolean isAdmin) {
        CTF ctf = ctfRepository.findById(ctfId);
        if (ctf == null) {
            throw new ApiException(404, "CTF_NOT_FOUND", "CTF Introuvable d'id : " + ctfId);
        }
        if (!isAdmin) {
            // Vérifier que le demandeur est l'organisateur du CTF
            if (!ctf.getContact().getEmail().equals(requesterEmail)) {
                throw new ApiException(403, "CTF_NOT_OWNER", "Vous n'êtes pas autorisé à voir les participations de ce CTF.");
            }
        }

        List<ParticipationSoloCtf> participations = switch (filter) {
            case ACTIVE -> participationRepository.findActiveParticipationsByCtfId(ctfId);
            case INACTIVE -> participationRepository.findInactiveParticipationsByCtfId(ctfId);
            case ALL -> participationRepository.findAllParticipationsByCtfId(ctfId);
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
