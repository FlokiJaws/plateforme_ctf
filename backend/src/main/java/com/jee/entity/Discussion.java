package com.jee.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "conversations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user1_email", "user2_email"}))
public class Discussion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user1_email", referencedColumnName = "email", nullable = false)
    private User user1;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user2_email", referencedColumnName = "email", nullable = false)
    private User user2;

    @Column(nullable = false)
    private Instant createdAt;

    @Column
    private Instant lastMessageAt;

    public Discussion() {
    }

    public Discussion(User user1, User user2) {
        // On s'assure que user1.email < user2.email pour éviter les doublons
        if (user1.getEmail().compareTo(user2.getEmail()) < 0) {
            this.user1 = user1;
            this.user2 = user2;
        } else {
            this.user1 = user2;
            this.user2 = user1;
        }
        this.createdAt = Instant.now();
        this.lastMessageAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser1() {
        return user1;
    }

    public void setUser1(User user1) {
        this.user1 = user1;
    }

    public User getUser2() {
        return user2;
    }

    public void setUser2(User user2) {
        this.user2 = user2;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(Instant lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    // obtenir l'autre user de la conversation
    public User getOtherUser(String currentUserEmail) {
        if (user1.getEmail().equals(currentUserEmail)) {
            return user2;
        }
        return user1;
    }
}