package com.jee.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "ctf_comments")
public class CommentaireCtf {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ctf_id", nullable = false)
    private CTF ctf;

    @ManyToOne
    @JoinColumn(name = "user_email", referencedColumnName = "email", nullable = false)
    private User user;

    @Column(nullable = false, length = 2000)
    private String contenu;

    @Column(nullable = false)
    private Instant date;


    public Long getId() {
        return id;
    }

    public CTF getCtf() {
        return ctf;
    }

    public User getUser() {
        return user;
    }

    public String getContenu() {
        return contenu;
    }

    public Instant getDate() {
        return date;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setCtf(CTF ctf) {
        this.ctf = ctf;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setContenu(String contenu) {
        this.contenu = contenu;
    }

    public void setDate(Instant date) {
        this.date = date;
    }
}
