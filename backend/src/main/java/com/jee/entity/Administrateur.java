package com.jee.entity;

import com.jee.entity.enums.Role;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "admins")
public class Administrateur extends User {

    public Administrateur() {
        super();
    }

    public Administrateur(String pseudo, String email, String password) {
        super(pseudo, email, password, Role.ADMINISTRATEUR);
    }

}
