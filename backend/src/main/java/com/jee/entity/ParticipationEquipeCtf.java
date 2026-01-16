package com.jee.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "participations_equipe_ctf",
        uniqueConstraints = @UniqueConstraint(columnNames = {"equipe_id", "ctf_id"})
)
public class ParticipationEquipeCtf {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "equipe_id", nullable = false)
    private Equipe equipe;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ctf_id", nullable = false)
    private CTF ctf;

    @Column(nullable = false)
    private Instant joinedAt;

    @Column private Instant completedAt;
    @Column private Instant leftAt;

    public void join() { this.joinedAt = Instant.now(); }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Equipe getEquipe() {
        return equipe;
    }

    public void setEquipe(Equipe equipe) {
        this.equipe = equipe;
    }

    public CTF getCtf() {
        return ctf;
    }

    public void setCtf(CTF ctf) {
        this.ctf = ctf;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(Instant joinedAt) {
        this.joinedAt = joinedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public Instant getLeftAt() {
        return leftAt;
    }

    public void setLeftAt(Instant leftAt) {
        this.leftAt = leftAt;
    }
}

