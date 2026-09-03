# Plateforme CTF — Gestion de compétitions Capture The Flag

Projet réalisé dans le cadre du cours **Applications Distribuées JEE** (M1 Informatique, Université de Limoges, 2025-2026), en binôme.

## 🔗 Démo en ligne

**[Voir la démo](URL_DU_SITE_À_COMPLÉTER)**

⚠️ Hébergé sur le tier gratuit Render — le premier chargement peut prendre 30 à 50 secondes le temps que le service se réveille.

### Accès démo (compte administrateur)

| Email | Mot de passe |
|---|---|
| `admin1@ctf.local` | `Demo2026!` |

*Compte de démonstration à usage limité, réinitialisable à tout moment — ne pas utiliser pour des données sensibles.*

## Contexte

Application inspirée de plateformes comme [Root-Me](https://www.root-me.org), [CTFd](https://ctfd.io) et [CTFtime](https://ctftime.org), permettant d'organiser et de participer à des CTF (*Capture The Flag*) : gestion des CTF, des défis d'entraînement, des équipes et des échanges entre utilisateurs.

## Rôles

- **Administrateur** — modère la plateforme, valide les nouveaux CTF avant publication, peut bannir un participant ou un organisateur
- **Organisateur** — crée, modifie et supprime ses CTF, publie les résultats
- **Participant** — consulte et rejoint des CTF, participe à des défis d'entraînement, commente, échange en messagerie privée

## Fonctionnalités

- Gestion des CTF (création, modération, publication, nombre de vues)
- Inscription / désinscription des participants aux CTF
- Système d'équipes : création, candidature validée par un chef d'équipe, transfert du rôle de chef
- Défis d'entraînement entre deux CTF, avec système de points et classement général
- Commentaires publics sur les annonces de CTF
- Messagerie privée (1 à 1) entre utilisateurs

## Stack technique

- **Backend** : Quarkus (Java EE), persistance via JPA/Hibernate
- **Frontend** : React
- **Base de données** : PostgreSQL (hébergée sur Render)
- **Conteneurisation** : Docker / Docker Compose

## Lancer le projet en local

```bash
git clone https://github.com/FlokiJaws/plateforme_ctf.git
cd plateforme_ctf
cp .env.example .env   # à compléter avec vos variables d'environnement
docker-compose up --build
```

Une fois lancé, se référer à `docker-compose.yml` pour les ports exposés du frontend et du backend.

## Structure du projet

```
plateforme_ctf/
├── backend/     # API Quarkus — entités Administrateur, Organisateur, Participant, Equipe, CTF, Défis, Discussion
├── frontend/    # Application React
└── docker-compose.yml
```

## Réinitialiser les données de démonstration

Si la base de données Render venait à expirer ou être supprimée (fréquent sur le tier gratuit après une longue période d'inactivité), voir **[`RECOVERY.md`](RECOVERY.md)** pour la procédure complète de restauration, avec le script SQL prêt à l'emploi.

## Auteurs

Marley Catillon ([@FlokiJaws](https://github.com/FlokiJaws)) — projet réalisé en binôme
