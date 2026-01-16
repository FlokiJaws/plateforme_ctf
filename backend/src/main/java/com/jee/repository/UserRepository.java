package com.jee.repository;

import com.jee.entity.Organisateur;
import com.jee.entity.Participant;
import com.jee.entity.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;

import java.util.List;


@ApplicationScoped
public class UserRepository {

    @Inject
    EntityManager em;

    public void persist(User user) {
        em.persist(user);
    }


    public List<User> findAllUsers() {
        return em.createQuery(
                "SELECT u FROM User u", User.class)
                .getResultList();
    }

    public List<Participant> findAllParticipantUsers() {
        return em.createQuery(
                "SELECT p FROM Participant p", Participant.class)
                .getResultList();
    }

    public List<Organisateur> findAllOrganisateurUsers() {
        return em.createQuery(
                "SELECT o FROM Organisateur o", Organisateur.class)
                .getResultList();
    }

    public List<User> findAllUnbannedUsers() {
        return em.createQuery(
                "SELECT u FROM User u WHERE u.banned = false", User.class)
                .getResultList();
    }

    public User findUserByEmail(String email) {
        try {
            return em.createQuery(
                    "SELECT u FROM User u WHERE u.email = :email", User.class)
                    .setParameter("email", email)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    public Participant findParticipantByEmail(String email) {
        try {
            return em.createQuery(
                    "SELECT p FROM Participant p WHERE p.email = :email", Participant.class)
                    .setParameter("email", email)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    public boolean existsByEmail(String email) {
        Long count = em.createQuery(
                "SELECT COUNT(u) FROM User u WHERE u.email = :email", Long.class)
                .setParameter("email", email)
                .getSingleResult();
        return count > 0;
    }

    public boolean existsByPseudo(String pseudo) {
        Long count = em.createQuery(
                        "SELECT COUNT(u) FROM User u WHERE u.pseudo = :pseudo", Long.class)
                .setParameter("pseudo", pseudo)
                .getSingleResult();
        return count > 0;
    }
}
