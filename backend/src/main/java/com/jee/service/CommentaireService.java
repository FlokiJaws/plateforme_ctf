package com.jee.service;

import com.jee.DTO.commentaire.CommentContentResponse;
import com.jee.entity.CTF;
import com.jee.entity.CommentaireCtf;
import com.jee.entity.User;
import com.jee.exceptionHandler.ApiException;
import com.jee.repository.CommentsRepository;
import com.jee.repository.CtfRepository;
import com.jee.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class CommentaireService {

    @Inject
    CommentsRepository commentsRepository;
    @Inject
    CtfRepository ctfRepository;
    @Inject
    UserRepository userRepository;

    public List<CommentContentResponse> getCommentsForCtf(Long ctfId) {

        CTF ctf = ctfRepository.findById(ctfId);
        if (ctf == null) {
            throw new ApiException(404, "CTF_NOT_FOUND", "CTF Introuvable avec l'id : " + ctfId);
        }

        List<CommentaireCtf> comments = commentsRepository.findAllByCtfId(ctfId);

        return comments.stream().map(comment -> {
            CommentContentResponse response = new CommentContentResponse();
            response.id = comment.getId();
            response.userPseudo = comment.getUser().getPseudo();
            response.ctfTitre = ctf.getTitre(); // ou comment.getCtf().getTitre()
            response.contenu = comment.getContenu();
            response.date = comment.getDate().toString();
            return response;
        }).toList();
    }

    public List<CommentContentResponse> getCommentsForUser(String userEmail) {
        User user = userRepository.findUserByEmail(userEmail);
        if (user == null) {
            throw new ApiException(404, "USER_NOT_FOUND", "Utilisateur introuvable avec l'id : " + userEmail);
        }

        List<CommentaireCtf> comments = commentsRepository.findAllByUserEmail(user.getEmail());

        return comments.stream().map(comment -> {
            CommentContentResponse response = new CommentContentResponse();
            response.id = comment.getId();
            response.userPseudo = user.getPseudo(); // ou comment.getUser().getPseudo()
            response.ctfTitre = comment.getCtf().getTitre();
            response.contenu = comment.getContenu();
            response.date = comment.getDate().toString();
            return response;
        }).toList();
    }

    @Transactional
    public void addCommentToCtf(Long ctfId, String userEmail, String contenu) {

        CTF ctf = ctfRepository.findById(ctfId);
        User user = userRepository.findUserByEmail(userEmail);

        if (ctf == null) {
            throw new ApiException(404, "CTF_NOT_FOUND", "CTF Introuvable avec l'id : " + ctfId);
        }

        if (user == null) {
            throw new ApiException(404, "USER_NOT_FOUND", "Utilisateur introuvable avec l'email : " + userEmail);
        }

        CommentaireCtf commentaire = new CommentaireCtf();
        commentaire.setCtf(ctf);
        commentaire.setUser(user);
        commentaire.setContenu(contenu);
        commentaire.setDate(java.time.Instant.now());

        commentsRepository.persist(commentaire);
    }

}




