package com.jee.entity;

import com.jee.entity.enums.Role;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "participants")
public class Participant extends User {
    private int score;

    public Participant() {
        super();
    }

    public Participant(String pseudo, String email, String password, int score) {
        super(pseudo, email, password, Role.PARTICIPANT);
        this.score = score;
    }

    public int getScore() {
        return score;
    }
}
