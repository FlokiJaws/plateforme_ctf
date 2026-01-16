package com.jee.service;

import com.jee.entity.Administrateur;
import com.jee.entity.Organisateur;
import com.jee.entity.Participant;
import com.jee.entity.User;
import com.jee.exceptionHandler.ApiException;
import com.jee.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import at.favre.lib.crypto.bcrypt.BCrypt;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class AuthService {

    @Inject
    UserRepository userRepository;

    private String hashPassword(String password) {
        return BCrypt
                .withDefaults()
                .hashToString(12, password.toCharArray());
    }

    private boolean checkPassword(String rawPassword, String hashed) {
        BCrypt.Result result = BCrypt
                .verifyer()
                .verify(rawPassword.toCharArray(), hashed);
        return result.verified;
    }

    @Transactional
    public void registerParticipant(String email, String pseudo, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(409, "EMAIL_ALREADY_USED", "Email déjà utilisé");
        } // 409 Conflict si l'email est déjà utilisé
        if (userRepository.existsByPseudo(pseudo)) {
            throw new ApiException(409, "PSEUDO_ALREADY_USED", "Pseudo déjà utilisé");
        } // 409 Conflict si le pseudo est déjà utilisé

        String hashedPassword = hashPassword(rawPassword);
        Participant user = new Participant(pseudo, email, hashedPassword, 0);
        userRepository.persist(user);
    }

    @Transactional
    public void registerOrganisateur(String email, String pseudo, String rawPassword, String organisation){
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(409, "EMAIL_ALREADY_USED", "Email déjà utilisé");
        } // 409 Conflict si l'email est déjà utilisé

        if (userRepository.existsByPseudo(pseudo)) {
            throw new ApiException(409, "PSEUDO_ALREADY_USED", "Pseudo déjà utilisé");
        } // 409 Conflict si le pseudo est déjà utilisé

        String hashedPassword = hashPassword(rawPassword);
        Organisateur user = new Organisateur(pseudo, email, hashedPassword, organisation);
        userRepository.persist(user);
    }

    @Transactional
    public void registerAdmin(String email, String pseudo, String rawPassword){
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(409, "EMAIL_ALREADY_USED", "Email déjà utilisé");
        } // 409 Conflict si l'email est déjà utilisé

        if (userRepository.existsByPseudo(pseudo)) {
            throw new ApiException(409, "PSEUDO_ALREADY_USED", "Pseudo déjà utilisé");
        } // 409 Conflict si le pseudo est déjà utilisé

        String hashedPassword = hashPassword(rawPassword);
        Administrateur user = new Administrateur(pseudo, email, hashedPassword);
        userRepository.persist(user);
    }

    public User authenticate(String email, String rawPassword) {

        User user = userRepository.findUserByEmail(email);

        if (user == null || !checkPassword(rawPassword, user.getPassword())) {
            throw new ApiException(401, "AUTHENTICATION_FAILED", "Email ou mot de passe incorrect");
        } // On evite de preciser si c'est l'email ou le mdp qui est incorrect pour des raisons de securite

        if (user.getBanned()) {
            throw new ApiException(403, "USER_BANNED", "Utilisateur banni");
        } // 403 Forbidden si l'utilisateur est banni
        return user;
    }
}
