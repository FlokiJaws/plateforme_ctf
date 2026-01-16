# ============================================
# DOCKERFILE MULTI-STAGE : PLATEFORME CTF
# Frontend (React+Vite) + Backend (Quarkus)
# ============================================

# --------------------------------------------
# STAGE 1 : BUILD FRONTEND (React + Vite)
# --------------------------------------------
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend

# Copier les fichiers de dépendances
COPY frontend/package*.json ./

# Installer les dépendances
RUN npm ci --legacy-peer-deps

# Copier le code source
COPY frontend/ ./

# Build de production
# La variable VITE_API_URL sera injectée au runtime
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --------------------------------------------
# STAGE 2 : BUILD BACKEND (Quarkus + Gradle)
# --------------------------------------------
FROM gradle:8.5-jdk21 AS backend-builder

WORKDIR /backend

# Copier les fichiers Gradle
COPY backend/gradle gradle
COPY backend/gradlew .
COPY backend/build.gradle .
COPY backend/settings.gradle .

# Télécharger les dépendances (layer de cache)
RUN ./gradlew dependencies --no-daemon || true

# Copier le code source backend
COPY backend/src src/

# Copier le frontend buildé dans les resources statiques de Quarkus
COPY --from=frontend-builder /frontend/dist ./src/main/resources/META-INF/resources/

# Build Quarkus en mode JVM optimisé
RUN ./gradlew build -Dquarkus.package.type=uber-jar -x test --no-daemon

# --------------------------------------------
# STAGE 3 : IMAGE FINALE (Runtime)
# --------------------------------------------
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 quarkus && \
    adduser -D -u 1001 -G quarkus quarkus

# Copier le uber-jar depuis le builder
COPY --from=backend-builder --chown=quarkus:quarkus \
    /backend/build/projet_ctf-*-runner.jar /app/app.jar

# Variables d'environnement par défaut
ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"
ENV QUARKUS_HTTP_PORT=8080

# Exposer le port
EXPOSE 8080

# Switch vers l'utilisateur non-root
USER quarkus

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/q/health/live || exit 1

# Lancer l'application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
