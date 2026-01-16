package com.jee.entity;

import com.jee.entity.enums.Role;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
public class User {

    @Id
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String pseudo;

    @Column(nullable = false)
    private String password;

    // Role non modifiable apres creation de l'objet
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false)
    private Role role;

    // Ban

    @Column(nullable = false)
    private boolean banned = false;

    private String banReason;
    private Instant banDate;


    public User() {
    }

    public User(String pseudo, String email, String password, Role role) {
        this.pseudo = pseudo;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public String getPseudo() {
        return pseudo;
    }
    public void setPseudo(String pseudo) {
        this.pseudo = pseudo;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setBanned(boolean banned) {
        this.banned = banned;
    }
    public boolean getBanned() {
        return banned;
    }
    public void setBanReason(String banReason) {
        this.banReason = banReason;
    }
    public String getBanReason() {
        return banReason;
    }
    public void setBanDate(Instant banDate) {
        this.banDate = banDate;
    }
    public Instant getBanDate() {
        return banDate;
    }
}
