package com.jee.repository;

import com.jee.entity.Defi;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.util.List;

@ApplicationScoped
public class DefiRepository {

    @Inject
    EntityManager em;


    public void persist(Defi defi) {
        em.persist(defi);
    }

    public Defi findById(Long id) {
        return em.createQuery("SELECT d FROM Defi d WHERE d.id = :id", Defi.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    public Defi findByTitle(String title) {
        return em.createQuery("SELECT d FROM Defi d WHERE d.titre = :title", Defi.class)
                .setParameter("title", title)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    public List<Defi> findAllDefis() {
        return em.createQuery("SELECT d FROM Defi d", Defi.class)
                .getResultList();
    }
}
