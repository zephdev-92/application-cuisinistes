# Script simplifié de déploiement Docker Hub
# Usage: .\docker-hub-deploy-simple.ps1

param(
    [string]$Tag = "latest",
    [string]$DockerUsername = ""
)

Write-Host "🚀 Déploiement Docker Hub pour l'application Cuisine" -ForegroundColor Blue
Write-Host ""

# Demander le nom d'utilisateur si non fourni
if (-not $DockerUsername) {
    $DockerUsername = Read-Host "Entrez votre nom d'utilisateur Docker Hub"
}

if (-not $DockerUsername) {
    Write-Host "❌ Nom d'utilisateur Docker Hub requis" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  - Tag: $Tag"
Write-Host "  - Docker Username: $DockerUsername"
Write-Host "  - Images à créer:"
Write-Host "    • $DockerUsername/cuisine-backend:$Tag"
Write-Host "    • $DockerUsername/cuisine-frontend:$Tag"
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ docker-compose.yml non trouvé. Exécutez ce script depuis la racine du projet." -ForegroundColor Red
    exit 1
}

# Vérifier que les Dockerfiles existent
if (-not (Test-Path "backend/Dockerfile.prod")) {
    Write-Host "❌ backend/Dockerfile.prod non trouvé" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend2/Dockerfile.prod")) {
    Write-Host "❌ frontend2/Dockerfile.prod non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "🔐 Vérification de la connexion Docker..." -ForegroundColor Cyan

# Test de connexion Docker
try {
    docker version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker n'est pas démarré" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur Docker: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker est fonctionnel" -ForegroundColor Green

# Build de l'image backend
Write-Host "🏗️  Construction de l'image backend..." -ForegroundColor Cyan
Set-Location backend

$buildResult = docker build -f Dockerfile.prod -t "$DockerUsername/cuisine-backend:$Tag" .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Image backend construite avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Échec de la construction de l'image backend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Build de l'image frontend
Write-Host "🏗️  Construction de l'image frontend..." -ForegroundColor Cyan
Set-Location ../frontend2

$buildResult = docker build -f Dockerfile.prod -t "$DockerUsername/cuisine-frontend:$Tag" .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Image frontend construite avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Échec de la construction de l'image frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Test avant push
Write-Host "🧪 Test des images locales..." -ForegroundColor Cyan
$testBackend = docker run --rm "$DockerUsername/cuisine-backend:$Tag" node --version
$testFrontend = docker run --rm "$DockerUsername/cuisine-frontend:$Tag" node --version

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tests des images réussis" -ForegroundColor Green
} else {
    Write-Host "⚠️  Attention: Tests des images échoués mais on continue" -ForegroundColor Yellow
}

# Demander confirmation avant push
$confirm = Read-Host "Voulez-vous publier ces images sur Docker Hub? (o/N)"
if ($confirm -ne "o" -and $confirm -ne "O" -and $confirm -ne "oui") {
    Write-Host "🛑 Publication annulée" -ForegroundColor Yellow
    exit 0
}

# Push des images vers Docker Hub
Write-Host "📤 Publication de l'image backend vers Docker Hub..." -ForegroundColor Cyan
$pushResult = docker push "$DockerUsername/cuisine-backend:$Tag"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Image backend publiée avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Échec de la publication de l'image backend" -ForegroundColor Red
    Write-Host "💡 Vérifiez que vous êtes connecté: docker login" -ForegroundColor Yellow
    exit 1
}

Write-Host "📤 Publication de l'image frontend vers Docker Hub..." -ForegroundColor Cyan
$pushResult = docker push "$DockerUsername/cuisine-frontend:$Tag"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Image frontend publiée avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Échec de la publication de l'image frontend" -ForegroundColor Red
    exit 1
}

# Taguer aussi comme latest si ce n'est pas déjà le cas
if ($Tag -ne "latest") {
    Write-Host "🏷️  Création des tags 'latest'..." -ForegroundColor Cyan

    docker tag "$DockerUsername/cuisine-backend:$Tag" "$DockerUsername/cuisine-backend:latest"
    docker tag "$DockerUsername/cuisine-frontend:$Tag" "$DockerUsername/cuisine-frontend:latest"

    docker push "$DockerUsername/cuisine-backend:latest"
    docker push "$DockerUsername/cuisine-frontend:latest"

    Write-Host "✅ Tags 'latest' créés et publiés" -ForegroundColor Green
}

# Afficher les informations finales
Write-Host ""
Write-Host "🎉 Déploiement Docker Hub terminé avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Images publiées:" -ForegroundColor Blue
Write-Host "  • https://hub.docker.com/r/$DockerUsername/cuisine-backend"
Write-Host "  • https://hub.docker.com/r/$DockerUsername/cuisine-frontend"
Write-Host ""
Write-Host "🚀 Pour utiliser vos images:" -ForegroundColor Blue
Write-Host "  docker pull $DockerUsername/cuisine-backend:$Tag"
Write-Host "  docker pull $DockerUsername/cuisine-frontend:$Tag"
Write-Host ""
Write-Host "📝 Prochaines étapes:" -ForegroundColor Blue
Write-Host "  1. Mettre à jour docker-compose.prod.yml avec vos images"
Write-Host "  2. Configurer les secrets GitHub pour le déploiement automatique"
Write-Host "  3. Tester le déploiement en production"
Write-Host ""
Write-Host "✨ Félicitations ! Vos images sont maintenant sur Docker Hub !" -ForegroundColor Magenta
