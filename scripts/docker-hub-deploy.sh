#!/bin/bash

# Script de déploiement Docker Hub pour l'application Cuisine
# Usage: ./docker-hub-deploy.sh [tag] [docker-username]

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables par défaut
TAG=${1:-latest}
DOCKER_USERNAME=${2:-$(docker info 2>/dev/null | grep -o 'Username: [^[:space:]]*' | cut -d' ' -f2)}

if [ -z "$DOCKER_USERNAME" ]; then
    echo -e "${RED}❌ Impossible de déterminer le nom d'utilisateur Docker Hub${NC}"
    echo "Usage: $0 [tag] [docker-username]"
    echo "Exemple: $0 v1.0.0 monusername"
    exit 1
fi

echo -e "${BLUE}🚀 Déploiement Docker Hub pour l'application Cuisine${NC}"
echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  - Tag: $TAG"
echo "  - Docker Username: $DOCKER_USERNAME"
echo "  - Images à créer:"
echo "    • $DOCKER_USERNAME/cuisine-backend:$TAG"
echo "    • $DOCKER_USERNAME/cuisine-frontend:$TAG"
echo ""

# Fonction de logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "docker-compose.yml" ]; then
    error "docker-compose.yml non trouvé. Exécutez ce script depuis la racine du projet."
    exit 1
fi

# Vérifier la connexion Docker Hub
log "🔐 Vérification de la connexion Docker Hub..."
if ! docker info | grep -q "Username"; then
    error "Vous n'êtes pas connecté à Docker Hub. Exécutez: docker login"
    exit 1
fi

# Build de l'image backend
log "🏗️  Construction de l'image backend..."
cd backend
if docker build -f Dockerfile.test -t "$DOCKER_USERNAME/cuisine-backend:$TAG" .; then
    log "✅ Image backend construite avec succès"
else
    error "Échec de la construction de l'image backend"
    exit 1
fi

# Build de l'image frontend
log "🏗️  Construction de l'image frontend..."
cd ../frontend2
if docker build -f Dockerfile.simple -t "$DOCKER_USERNAME/cuisine-frontend:$TAG" .; then
    log "✅ Image frontend construite avec succès"
else
    error "Échec de la construction de l'image frontend"
    exit 1
fi

cd ..

# Push des images vers Docker Hub
log "📤 Publication de l'image backend vers Docker Hub..."
if docker push "$DOCKER_USERNAME/cuisine-backend:$TAG"; then
    log "✅ Image backend publiée avec succès"
else
    error "Échec de la publication de l'image backend"
    exit 1
fi

log "📤 Publication de l'image frontend vers Docker Hub..."
if docker push "$DOCKER_USERNAME/cuisine-frontend:$TAG"; then
    log "✅ Image frontend publiée avec succès"
else
    error "Échec de la publication de l'image frontend"
    exit 1
fi

# Taguer aussi comme latest si ce n'est pas déjà le cas
if [ "$TAG" != "latest" ]; then
    log "🏷️  Création des tags 'latest'..."

    docker tag "$DOCKER_USERNAME/cuisine-backend:$TAG" "$DOCKER_USERNAME/cuisine-backend:latest"
    docker tag "$DOCKER_USERNAME/cuisine-frontend:$TAG" "$DOCKER_USERNAME/cuisine-frontend:latest"

    docker push "$DOCKER_USERNAME/cuisine-backend:latest"
    docker push "$DOCKER_USERNAME/cuisine-frontend:latest"

    log "✅ Tags 'latest' créés et publiés"
fi

# Afficher les informations finales
echo ""
echo -e "${GREEN}🎉 Déploiement Docker Hub terminé avec succès !${NC}"
echo ""
echo -e "${BLUE}📋 Images publiées:${NC}"
echo "  • https://hub.docker.com/r/$DOCKER_USERNAME/cuisine-backend"
echo "  • https://hub.docker.com/r/$DOCKER_USERNAME/cuisine-frontend"
echo ""
echo -e "${BLUE}🚀 Pour utiliser vos images:${NC}"
echo "  docker pull $DOCKER_USERNAME/cuisine-backend:$TAG"
echo "  docker pull $DOCKER_USERNAME/cuisine-frontend:$TAG"
echo ""
echo -e "${BLUE}📝 Prochaines étapes:${NC}"
echo "  1. Mettre à jour docker-compose.prod.yml avec vos images"
echo "  2. Configurer les secrets GitHub pour le déploiement automatique"
echo "  3. Tester le déploiement en production"
