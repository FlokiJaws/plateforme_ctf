package com.jee.entity;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "equipes")
public class Equipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    @Column(name = "logo_url")
    private String logoUrl;

    @OneToOne
    @JoinColumn(name = "chef_email") // plus clair que User_email
    private Participant chef_equipe;

    @OneToMany(mappedBy = "equipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CandidatureMembre> membres;

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setChef_equipe(Participant chef_equipe) {
        this.chef_equipe = chef_equipe;
    }

    public Participant getChef_equipe() {
        return chef_equipe;
    }

    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public String getLogoUrl() {
        return logoUrl;
    }
}
