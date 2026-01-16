package com.jee.service;

import com.jee.DTO.user.ParticipantInfoPublicResponse;
import com.jee.DTO.user.UserInfoAdminResponse;
import com.jee.DTO.user.UserPublicDetails;
import com.jee.entity.Organisateur;
import com.jee.entity.Participant;
import com.jee.entity.User;
import com.jee.exceptionHandler.ApiException;
import com.jee.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class UserService {

    @Inject
    UserRepository userRepository;

    @Transactional
    public void banUser(String email, String reason) {

        User user = userRepository.findUserByEmail(email);

        if (user == null) {
            throw new ApiException(404, "USER_NOT_FOUND", "Utilisateur non trouvé");
        }

        user.setBanned(true);
        user.setBanReason(reason);
        user.setBanDate(java.time.Instant.now());
    }

    public List<UserInfoAdminResponse> getAllUsersForAdmin() {
        List<User> users = userRepository.findAllUsers();

        return users.stream().map(user -> {
            UserInfoAdminResponse response = new UserInfoAdminResponse();
            response.email = user.getEmail();
            response.pseudo = user.getPseudo();
            response.role = user.getRole().name();
            response.banned = user.getBanned();
            response.banReason = user.getBanReason();
            response.banDate = user.getBanDate() != null ? user.getBanDate().toString() : null;
            return response;
        }).toList();
    }

    public List<ParticipantInfoPublicResponse> getAllUsersForPublic() {
        List<Participant> users = userRepository.findAllParticipantUsers();

        if (users.isEmpty()) {
            throw new ApiException(404, "NO_PARTICIPANTS_FOUND", "Aucun participant trouvé");
        } // Erreur de changement

        return users.stream().map(user -> {
            ParticipantInfoPublicResponse response = new ParticipantInfoPublicResponse();
            response.pseudo = user.getPseudo();
            response.score = user.getScore();
            return response;
        }).toList();
    }

    public List<UserPublicDetails> getAllOrganisateurs() {
        List<Organisateur> users = userRepository.findAllOrganisateurUsers();

        return users.stream().map(user -> {
            UserPublicDetails response = new UserPublicDetails();
            response.pseudo = user.getPseudo();
            response.email = user.getEmail();
            return response;
        }).toList();
    }
}
