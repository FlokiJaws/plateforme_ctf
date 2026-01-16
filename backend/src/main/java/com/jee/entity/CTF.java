package com.jee.entity;

import com.jee.entity.enums.CtfStatut;
import jakarta.persistence.*;

@Entity
@Table(name = "ctfs")
public class CTF {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;
    private String description;
    private String lieu;

    private int nbVues;

    @Enumerated(EnumType.STRING)
    private CtfStatut statut;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "organisateur_email",
            referencedColumnName = "email",
            nullable = false
    )
    private Organisateur contact;


    public CTF() {
    }






    public void setTitre(String titre) {
        this.titre = titre;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setLieu(String lieu) {
        this.lieu = lieu;
    }

    public void setNbVues(int nbVues) {
        this.nbVues = nbVues;
    }

    public void setStatut(CtfStatut statut) {
        this.statut = statut;
    }

    public void setContact(Organisateur contact) {
        this.contact = contact;
    }


    public Long getId() {
        return id;
    }

    public String getTitre() {
        return titre;
    }

    public String getDescription() {
        return description;
    }

    public String getLieu() {
        return lieu;
    }

    public int getNbVues() {
        return nbVues;
    }

    public Organisateur getContact() {
        return contact;
    }

    public CtfStatut getStatut() {
        return statut;
    }
}
