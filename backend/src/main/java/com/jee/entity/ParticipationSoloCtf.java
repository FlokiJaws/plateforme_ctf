package com.jee.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "participations_ctf")
public class ParticipationSoloCtf {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ctf_id", nullable = false)
    private CTF ctf;

    @Column(nullable = false)
    private Instant joinedAt;

    @Column
    private Instant completedAt;

    @Column
    private Instant leftAt;

    public Instant getJoinedAt() {
        return joinedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public Instant getLeftAt() {
        return leftAt;
    }

    public Participant getParticipant() {
        return participant;
    }

    public CTF getCtf() {
        return ctf;
    }

    public void setParticipant(Participant participant) {
        this.participant = participant;
    }

    public void setCtf(CTF ctf) {
        this.ctf = ctf;
    }

    public void join() {
        this.joinedAt = Instant.now();
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public void setLeftAt(Instant leftAt) {
        this.leftAt = leftAt;
    }
}
