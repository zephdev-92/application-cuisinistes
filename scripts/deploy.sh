#!/bin/bash

# 🚀 Script de déploiement automatisé - Application Cuisinistes
# Auteur: Système CI/CD
# Version: 1.0

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# =================================================================
# 📋 CONFIGURATION
# =================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_USER="${DEPLOY_USER:-deployer}"
DEPLOY_HOST="${DEPLOY_HOST:-localhost}"
APP_NAME="cuisine-app"
DEPLOY_PATH="/opt/${APP_NAME}"
BACKUP_PATH="/opt/backups/${APP_NAME}"
LOG_FILE="/var/log/${APP_NAME}-deploy.log"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =================================================================
# 🛠️  FONCTIONS UTILITAIRES
# =================================================================
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

# =================================================================
# 🔍 VÉRIFICATIONS PRÉ-DÉPLOIEMENT
# =================================================================
check_prerequisites() {
    log "🔍 Vérification des prérequis..."

    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé"
        exit 1
    fi

    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose n'est pas installé"
        exit 1
    fi

    # Vérifier les variables d'environnement
    required_vars=(
        "MONGODB_URI"
        "JWT_SECRET"
        "REDIS_PASSWORD"
        "MINIO_ACCESS_KEY"
        "MINIO_SECRET_KEY"
    )

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Variable d'environnement manquante: $var"
            exit 1
        fi
    done

    success "Prérequis validés"
}

# =================================================================
# 💾 BACKUP
# =================================================================
create_backup() {
    log "💾 Création de la sauvegarde..."

    BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_DIR="${BACKUP_PATH}/${BACKUP_TIMESTAMP}"

    mkdir -p "$BACKUP_DIR"

    # Sauvegarder les volumes Docker
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log "Sauvegarde des données MongoDB..."
        docker-compose -f docker-compose.prod.yml exec -T mongo mongodump --authenticationDatabase admin -u "$MONGO_ROOT_USER" -p "$MONGO_ROOT_PASSWORD" --archive | gzip > "${BACKUP_DIR}/mongodb_backup.gz"

        log "Sauvegarde des données Redis..."
        docker-compose -f docker-compose.prod.yml exec -T redis redis-cli --no-auth-warning -a "$REDIS_PASSWORD" BGSAVE
        docker cp cuisine-redis-prod:/data/dump.rdb "${BACKUP_DIR}/redis_backup.rdb"

        log "Sauvegarde des fichiers uploadés..."
        docker cp cuisine-backend-prod:/app/uploads "${BACKUP_DIR}/uploads"

        log "Sauvegarde des logs d'audit..."
        docker cp cuisine-backend-prod:/app/logs "${BACKUP_DIR}/logs"
    fi

    # Conserver seulement les 10 dernières sauvegardes
    ls -1t "${BACKUP_PATH}" | tail -n +11 | xargs -r -I {} rm -rf "${BACKUP_PATH}/{}"

    success "Sauvegarde créée: $BACKUP_DIR"
}

# =================================================================
# 🏗️  DÉPLOIEMENT
# =================================================================
deploy() {
    log "🏗️  Déploiement de l'application..."

    # Naviguer vers le répertoire du projet
    cd "$PROJECT_ROOT"

    # Arrêter les services existants
    log "🛑 Arrêt des services existants..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans || warning "Aucun service à arrêter"

    # Nettoyer les images inutiles
    log "🧹 Nettoyage des images Docker..."
    docker image prune -f
    docker system prune -f --volumes

    # Construire les nouvelles images
    log "🔨 Construction des images..."
    docker-compose -f docker-compose.prod.yml build --no-cache --pull

    # Démarrer les services
    log "🚀 Démarrage des services..."
    docker-compose -f docker-compose.prod.yml up -d

    # Attendre que les services soient prêts
    log "⏳ Attente de la disponibilité des services..."
    wait_for_services

    success "Déploiement terminé"
}

# =================================================================
# ⏳ ATTENTE DES SERVICES
# =================================================================
wait_for_services() {
    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        log "Tentative $attempt/$max_attempts..."

        # Vérifier la santé de l'API
        if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
            success "API backend opérationnelle"
            break
        fi

        if [[ $attempt -eq $max_attempts ]]; then
            error "Timeout: Services non disponibles après $max_attempts tentatives"
            show_logs
            exit 1
        fi

        sleep 10
        ((attempt++))
    done
}

# =================================================================
# 📊 AFFICHAGE DES LOGS
# =================================================================
show_logs() {
    log "📊 Logs des services:"
    docker-compose -f docker-compose.prod.yml logs --tail=50
}

# =================================================================
# 🧪 TESTS POST-DÉPLOIEMENT
# =================================================================
run_health_checks() {
    log "🧪 Exécution des tests de santé..."

    # Test API Health
    if curl -f -s http://localhost:5000/health | grep -q '"success":true'; then
        success "✅ API Health Check: OK"
    else
        error "❌ API Health Check: FAILED"
        return 1
    fi

    # Test base de données
    if docker-compose -f docker-compose.prod.yml exec -T mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        success "✅ MongoDB Health Check: OK"
    else
        error "❌ MongoDB Health Check: FAILED"
        return 1
    fi

    # Test Redis
    if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli --no-auth-warning -a "$REDIS_PASSWORD" ping | grep -q "PONG"; then
        success "✅ Redis Health Check: OK"
    else
        error "❌ Redis Health Check: FAILED"
        return 1
    fi

    success "Tous les tests de santé sont passés"
}

# =================================================================
# 📈 MONITORING POST-DÉPLOIEMENT
# =================================================================
show_status() {
    log "📈 État des services:"
    docker-compose -f docker-compose.prod.yml ps

    log "💾 Utilisation des ressources:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

    log "🌐 Points d'accès:"
    echo "- API Backend: http://localhost:5000"
    echo "- API Health: http://localhost:5000/health"
    echo "- Nginx Proxy: http://localhost:80"
}

# =================================================================
# 🔄 ROLLBACK
# =================================================================
rollback() {
    log "🔄 Rollback vers la version précédente..."

    # Arrêter les services actuels
    docker-compose -f docker-compose.prod.yml down

    # Restaurer la dernière sauvegarde
    latest_backup=$(ls -1t "${BACKUP_PATH}" | head -n 1)

    if [[ -n "$latest_backup" ]]; then
        log "Restauration de la sauvegarde: $latest_backup"
        # Logique de restauration ici
        warning "Rollback simulé - implémentez la logique de restauration"
    else
        error "Aucune sauvegarde disponible pour le rollback"
        exit 1
    fi
}

# =================================================================
# 🎯 FONCTION PRINCIPALE
# =================================================================
main() {
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            create_backup
            deploy
            run_health_checks
            show_status
            ;;
        "rollback")
            rollback
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "backup")
            create_backup
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|status|logs|backup}"
            exit 1
            ;;
    esac
}

# Exécution du script
main "$@"
