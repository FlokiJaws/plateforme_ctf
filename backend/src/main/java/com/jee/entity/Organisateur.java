package com.jee.entity;
import com.jee.entity.enums.Role;
import jakarta.persistence.*;

@Entity
@Table(name="organisateurs")
@PrimaryKeyJoinColumn(name="email")
public class Organisateur extends User {
    private String organisation;

    public Organisateur() {
        super();
    }

    public Organisateur(String pseudo, String email, String password, String organisation) {
        super(pseudo, email, password, Role.ORGANISATEUR);
        this.organisation = organisation;
    }
}
