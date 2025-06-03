# Script de déploiement Docker Hub pour l'application Cuisine (PowerShell)
# Usage: .\docker-hub-deploy.ps1 [tag] [docker-username]

param(
    [string]$Tag = "latest",
    [string]$DockerUsername = ""
)

# Fonction pour afficher des messages colorés
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" "Yellow"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️  $Message" "Cyan"
}

# Obtenir le nom d'utilisateur Docker si non fourni
if (-not $DockerUsername) {
    try {
        $DockerInfo = docker info 2>$null | Out-String
        if ($DockerInfo -match "Username:\s*(\S+)") {
            $DockerUsername = $matches[1]
        }
    }
    catch {
        Write-Error "Impossible de récupérer les informations Docker"
    }
}

if (-not $DockerUsername) {
    Write-Error "Impossible de déterminer le nom d'utilisateur Docker Hub"
    Write-Host "Usage: .\docker-hub-deploy.ps1 [tag] [docker-username]"
    Write-Host "Exemple: .\docker-hub-deploy.ps1 v1.0.0 monusername"
    exit 1
}

Write-ColorOutput "🚀 Déploiement Docker Hub pour l'application Cuisine" "Blue"
Write-ColorOutput "📋 Configuration:" "Yellow"
Write-Host "  - Tag: $Tag"
Write-Host "  - Docker Username: $DockerUsername"
Write-Host "  - Images à créer:"
Write-Host "    • $DockerUsername/cuisine-backend:$Tag"
Write-Host "    • $DockerUsername/cuisine-frontend:$Tag"
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "docker-compose.yml")) {
    Write-Error "docker-compose.yml non trouvé. Exécutez ce script depuis la racine du projet."
    exit 1
}

# Vérifier la connexion Docker Hub
Write-Info "🔐 Vérification de la connexion Docker Hub..."
try {
    $DockerInfo = docker info 2>$null | Out-String
    if (-not ($DockerInfo -match "Username:")) {
        Write-Error "Vous n'êtes pas connecté à Docker Hub. Exécutez: docker login"
        exit 1
    }
}
catch {
    Write-Error "Impossible de vérifier la connexion Docker Hub"
    exit 1
}

# Vérifier que les Dockerfiles existent
if (-not (Test-Path "backend/Dockerfile.prod")) {
    Write-Error "backend/Dockerfile.prod non trouvé"
    exit 1
}

if (-not (Test-Path "frontend2/Dockerfile.prod")) {
    Write-Error "frontend2/Dockerfile.prod non trouvé"
    exit 1
}

# Build de l'image backend
Write-Info "🏗️  Construction de l'image backend..."
Set-Location backend
$result = docker build -f Dockerfile.prod -t "$DockerUsername/cuisine-backend:$Tag" . 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "Image backend construite avec succès"
} else {
    Write-Error "Échec de la construction de l'image backend"
    Write-Host $result
    exit 1
}

# Build de l'image frontend
Write-Info "🏗️  Construction de l'image frontend..."
Set-Location ../frontend2
$result = docker build -f Dockerfile.prod -t "$DockerUsername/cuisine-frontend:$Tag" . 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "Image frontend construite avec succès"
} else {
    Write-Error "Échec de la construction de l'image frontend"
    Write-Host $result
    exit 1
}

Set-Location ..

# Push des images vers Docker Hub
Write-Info "📤 Publication de l'image backend vers Docker Hub..."
$result = docker push "$DockerUsername/cuisine-backend:$Tag" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "Image backend publiée avec succès"
} else {
    Write-Error "Échec de la publication de l'image backend"
    Write-Host $result
    exit 1
}

Write-Info "📤 Publication de l'image frontend vers Docker Hub..."
$result = docker push "$DockerUsername/cuisine-frontend:$Tag" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "Image frontend publiée avec succès"
} else {
    Write-Error "Échec de la publication de l'image frontend"
    Write-Host $result
    exit 1
}

# Taguer aussi comme latest si ce n'est pas déjà le cas
if ($Tag -ne "latest") {
    Write-Info "🏷️  Création des tags 'latest'..."

    docker tag "$DockerUsername/cuisine-backend:$Tag" "$DockerUsername/cuisine-backend:latest"
    docker tag "$DockerUsername/cuisine-frontend:$Tag" "$DockerUsername/cuisine-frontend:latest"

    docker push "$DockerUsername/cuisine-backend:latest"
    docker push "$DockerUsername/cuisine-frontend:latest"

    Write-Success "Tags 'latest' créés et publiés"
}

# Afficher les informations finales
Write-Host ""
Write-ColorOutput "🎉 Déploiement Docker Hub terminé avec succès !" "Green"
Write-Host ""
Write-ColorOutput "📋 Images publiées:" "Blue"
Write-Host "  • https://hub.docker.com/r/$DockerUsername/cuisine-backend"
Write-Host "  • https://hub.docker.com/r/$DockerUsername/cuisine-frontend"
Write-Host ""
Write-ColorOutput "🚀 Pour utiliser vos images:" "Blue"
Write-Host "  docker pull $DockerUsername/cuisine-backend:$Tag"
Write-Host "  docker pull $DockerUsername/cuisine-frontend:$Tag"
Write-Host ""
Write-ColorOutput "📝 Prochaines étapes:" "Blue"
Write-Host "  1. Mettre à jour docker-compose.prod.yml avec vos images"
Write-Host "  2. Configurer les secrets GitHub pour le déploiement automatique"
Write-Host "  3. Tester le déploiement en production"
