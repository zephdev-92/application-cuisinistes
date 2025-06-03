#!/bin/bash

# 🔍 Script de Validation des Secrets GitHub
# Vérifie que tous les secrets nécessaires sont configurés

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
REPO_URL=""
MISSING_SECRETS=()
TOTAL_SECRETS=0
CONFIGURED_SECRETS=0

# Liste des secrets requis
REQUIRED_SECRETS=(
    # Docker Hub
    "DOCKER_USERNAME"
    "DOCKER_PASSWORD"

    # Base de données
    "MONGO_ROOT_USER"
    "MONGO_ROOT_PASSWORD"
    "MONGO_APP_USER"
    "MONGO_APP_PASSWORD"
    "MONGO_DATABASE"
    "MONGODB_URI"

    # Sécurité
    "JWT_SECRET"
    "JWT_EXPIRES_IN"
    "BCRYPT_SALT_ROUNDS"

    # Redis
    "REDIS_PASSWORD"

    # MinIO
    "MINIO_ACCESS_KEY"
    "MINIO_SECRET_KEY"
    "MINIO_BUCKET_NAME"

    # Email
    "EMAIL_HOST"
    "EMAIL_PORT"
    "EMAIL_USER"
    "EMAIL_PASS"

    # Déploiement
    "DEPLOY_HOST"
    "DEPLOY_USER"
    "DEPLOY_SSH_KEY"
    "DOMAIN_NAME"

    # Sécurité additionnelle
    "RATE_LIMIT_WINDOW_MS"
    "RATE_LIMIT_MAX_REQUESTS"
    "MAX_FILE_SIZE"
)

# Fonctions utilitaires
print_header() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "  🔐 VALIDATION DES SECRETS GITHUB"
    echo "=============================================="
    echo -e "${NC}"
}

print_section() {
    echo -e "\n${BLUE}📋 $1${NC}"
    echo "----------------------------------------"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Vérifier si GitHub CLI est installé
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) n'est pas installé"
        print_info "Installez-le avec: https://cli.github.com/"
        exit 1
    fi

    # Vérifier l'authentification
    if ! gh auth status &> /dev/null; then
        print_error "Vous n'êtes pas authentifié avec GitHub CLI"
        print_info "Connectez-vous avec: gh auth login"
        exit 1
    fi

    print_success "GitHub CLI configuré et authentifié"
}

# Obtenir l'URL du repository
get_repo_info() {
    if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
        REPO_URL=$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/' | sed 's/\.git$//')
        print_info "Repository détecté: $REPO_URL"
    else
        print_warning "Impossible de détecter le repository automatiquement"
        read -p "Entrez l'URL du repository (format: owner/repo): " REPO_URL
    fi
}

# Vérifier les secrets
check_secrets() {
    print_section "Vérification des secrets"

    # Obtenir la liste des secrets configurés
    local configured_secrets_list
    configured_secrets_list=$(gh secret list -R "$REPO_URL" --json name -q '.[].name' 2>/dev/null || echo "")

    for secret in "${REQUIRED_SECRETS[@]}"; do
        TOTAL_SECRETS=$((TOTAL_SECRETS + 1))

        if echo "$configured_secrets_list" | grep -q "^$secret$"; then
            print_success "$secret"
            CONFIGURED_SECRETS=$((CONFIGURED_SECRETS + 1))
        else
            print_error "$secret - MANQUANT"
            MISSING_SECRETS+=("$secret")
        fi
    done
}

# Vérifier les environnements
check_environments() {
    print_section "Vérification des environnements"

    local environments
    environments=$(gh api "repos/$REPO_URL/environments" --jq '.[].name' 2>/dev/null || echo "")

    if echo "$environments" | grep -q "production"; then
        print_success "Environnement 'production' configuré"
    else
        print_warning "Environnement 'production' non configuré"
        print_info "Créez-le dans Settings > Environments"
    fi

    if echo "$environments" | grep -q "staging"; then
        print_success "Environnement 'staging' configuré"
    else
        print_warning "Environnement 'staging' non configuré (optionnel)"
    fi
}

# Vérifier les workflows
check_workflows() {
    print_section "Vérification des workflows"

    local workflows_dir=".github/workflows"

    if [[ -f "$workflows_dir/ci.yml" ]]; then
        print_success "Workflow CI/CD configuré"
    else
        print_error "Workflow CI/CD manquant: $workflows_dir/ci.yml"
    fi

    if [[ -f "$workflows_dir/pr-checks.yml" ]]; then
        print_success "Workflow PR checks configuré"
    else
        print_warning "Workflow PR checks manquant: $workflows_dir/pr-checks.yml"
    fi
}

# Validation de la sécurité des secrets
validate_secret_security() {
    print_section "Validation de la sécurité"

    # Vérifier que les secrets ne sont pas dans .env ou autres fichiers
    local insecure_files=(
        ".env"
        ".env.local"
        ".env.production"
        "docker-compose.override.yml"
    )

    for file in "${insecure_files[@]}"; do
        if [[ -f "$file" ]]; then
            # Chercher des patterns de secrets
            if grep -q "JWT_SECRET\|MONGO.*PASSWORD\|REDIS_PASSWORD" "$file" 2>/dev/null; then
                print_error "Secrets trouvés dans $file - RISQUE DE SÉCURITÉ"
            else
                print_success "$file ne contient pas de secrets en dur"
            fi
        fi
    done

    # Vérifier .gitignore
    if [[ -f ".gitignore" ]] && grep -q "\.env" ".gitignore"; then
        print_success "Fichiers .env ignorés par Git"
    else
        print_warning "Ajoutez .env* à votre .gitignore"
    fi
}

# Générer un rapport
generate_report() {
    print_section "Rapport de validation"

    local success_rate=$((CONFIGURED_SECRETS * 100 / TOTAL_SECRETS))

    echo -e "📊 ${BLUE}Statistiques:${NC}"
    echo "   • Secrets configurés: $CONFIGURED_SECRETS/$TOTAL_SECRETS ($success_rate%)"
    echo "   • Secrets manquants: ${#MISSING_SECRETS[@]}"

    if [[ ${#MISSING_SECRETS[@]} -gt 0 ]]; then
        echo -e "\n🚨 ${RED}Secrets manquants:${NC}"
        for secret in "${MISSING_SECRETS[@]}"; do
            echo "   • $secret"
        done

        echo -e "\n💡 ${YELLOW}Actions recommandées:${NC}"
        echo "   1. Allez dans Settings > Secrets and variables > Actions"
        echo "   2. Cliquez sur 'New repository secret'"
        echo "   3. Ajoutez chaque secret manquant"
        echo "   4. Consultez docs/GITHUB_SECRETS_SETUP.md pour les valeurs"
    fi

    if [[ $success_rate -eq 100 ]]; then
        print_success "🎉 Tous les secrets sont configurés!"
        echo -e "\n${GREEN}✨ Votre CI/CD est prêt pour le déploiement!${NC}"
    else
        print_warning "⚠️  Configuration incomplète"
        echo -e "\n${YELLOW}🔧 Configurez les secrets manquants avant le déploiement${NC}"
    fi
}

# Afficher les commandes de génération de secrets
show_secret_generation() {
    if [[ ${#MISSING_SECRETS[@]} -gt 0 ]]; then
        print_section "Génération de secrets"

        echo -e "${BLUE}Commandes pour générer des secrets sécurisés:${NC}\n"

        for secret in "${MISSING_SECRETS[@]}"; do
            case $secret in
                "JWT_SECRET")
                    echo "# $secret"
                    echo "openssl rand -base64 64"
                    echo ""
                    ;;
                *"PASSWORD"*)
                    echo "# $secret"
                    echo "openssl rand -base64 32"
                    echo ""
                    ;;
                *"KEY"* | *"SECRET"*)
                    echo "# $secret"
                    echo "openssl rand -base64 32"
                    echo ""
                    ;;
            esac
        done
    fi
}

# Fonction principale
main() {
    print_header

    check_gh_cli
    get_repo_info
    check_secrets
    check_environments
    check_workflows
    validate_secret_security

    echo ""
    generate_report
    show_secret_generation

    echo -e "\n${BLUE}📚 Documentation:${NC}"
    echo "   • Guide complet: docs/GITHUB_SECRETS_SETUP.md"
    echo "   • Configuration Docker: docker-compose.prod.yml"
    echo "   • Scripts de déploiement: scripts/deploy.sh"

    # Code de sortie basé sur le succès
    if [[ ${#MISSING_SECRETS[@]} -eq 0 ]]; then
        exit 0
    else
        exit 1
    fi
}

# Exécution
main "$@"
