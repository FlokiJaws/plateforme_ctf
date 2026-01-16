package com.jee.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "defis")
public class Defi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String titre;
    private int points;

    public Defi(String titre, int points) {
        this.titre = titre;
        this.points = points;
    }

    public Defi() {
    }

    public Long getId() {
        return id;
    }
    public String getTitre() {
        return titre;
    }
    public int getPoints() {
        return points;
    }

    public void setId(Long id) {
        this.id = id;
    }
    public void setTitre(String titre) {
        this.titre = titre;
    }
    public void setPoints(int points) {
        this.points = points;
    }
}
