#!/bin/bash

# ============================================
# SCRIPT DE MIGRATION DES URLs API
# Remplace les URLs hardcodées par des variables d'environnement
# ============================================

echo "🔧 Migration des URLs API dans le frontend..."

# Répertoire du frontend
FRONTEND_DIR="./frontend/src"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Erreur: Le répertoire $FRONTEND_DIR n'existe pas"
    exit 1
fi

# Créer le fichier de configuration API
cat > "${FRONTEND_DIR}/config/api.js" << 'EOF'
// Configuration API centralisée
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    TIMEOUT: 10000,
};

// Helper pour construire les URLs
export const buildApiUrl = (endpoint) => {
    // Enlever le / au début si présent
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};

export default API_CONFIG;
EOF

echo "✅ Fichier de configuration API créé: ${FRONTEND_DIR}/config/api.js"

# Créer le répertoire config si inexistant
mkdir -p "${FRONTEND_DIR}/config"

# Remplacer toutes les occurrences de http://localhost:8080
# par l'import de la configuration
echo "🔍 Recherche des fichiers avec URLs hardcodées..."

# Compter les occurrences
COUNT=$(grep -r "http://localhost:8080" "$FRONTEND_DIR" --include="*.js" --include="*.jsx" | wc -l)
echo "📊 Trouvé $COUNT occurrences de 'http://localhost:8080'"

if [ $COUNT -eq 0 ]; then
    echo "✅ Aucune URL hardcodée trouvée!"
    exit 0
fi

# Demander confirmation
read -p "❓ Voulez-vous remplacer automatiquement ces URLs? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration annulée"
    exit 0
fi

# Backup
BACKUP_DIR="./frontend_backup_$(date +%Y%m%d_%H%M%S)"
echo "💾 Création d'un backup dans $BACKUP_DIR..."
cp -r "$FRONTEND_DIR" "$BACKUP_DIR"

# Remplacement dans tous les fichiers
echo "🔄 Remplacement en cours..."

find "$FRONTEND_DIR" -type f \( -name "*.js" -o -name "*.jsx" \) -print0 | while IFS= read -r -d '' file; do
    # Vérifier si le fichier contient l'URL
    if grep -q "http://localhost:8080" "$file"; then
        echo "  📝 Modification: $file"

        # Ajouter l'import en haut du fichier s'il n'existe pas
        if ! grep -q "import.*buildApiUrl.*from.*config/api" "$file"; then
            # Trouver la dernière ligne d'import
            LAST_IMPORT=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)

            if [ -n "$LAST_IMPORT" ]; then
                # Insérer après la dernière ligne d'import
                sed -i "${LAST_IMPORT}a import { buildApiUrl } from '@/config/api';" "$file"
            else
                # Pas d'import, ajouter en début de fichier
                sed -i "1i import { buildApiUrl } from '@/config/api';" "$file"
            fi
        fi

        # Remplacer les URLs
        # Pattern 1: "http://localhost:8080/endpoint" -> buildApiUrl('/endpoint')
        sed -i 's|"http://localhost:8080/\([^"]*\)"|buildApiUrl("/\1")|g' "$file"

        # Pattern 2: 'http://localhost:8080/endpoint' -> buildApiUrl('/endpoint')
        sed -i "s|'http://localhost:8080/\([^']*\)'|buildApiUrl('/\\1')|g" "$file"

        # Pattern 3: `http://localhost:8080/endpoint` -> buildApiUrl('/endpoint')
        sed -i 's|`http://localhost:8080/\([^`]*\)`|buildApiUrl(`/\1`)|g' "$file"
    fi
done

echo ""
echo "✅ Migration terminée!"
echo "📦 Backup sauvegardé dans: $BACKUP_DIR"
echo ""
echo "⚠️  IMPORTANT: Vérifiez manuellement les fichiers modifiés"
echo "   - Testez l'application en local"
echo "   - Si problème, restaurez depuis le backup"
echo ""
echo "🔄 Pour appliquer les changements:"
echo "   cd frontend"
echo "   npm install"
echo "   npm run dev"
