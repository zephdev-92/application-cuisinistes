# Script de déploiement Docker Hub - Backend + Frontend
# Usage: .\docker-hub-deploy-both.ps1 [tag] [username]

param(
    [string]$Tag = "latest",
    [string]$DockerUsername = "zephdev92"
)

Write-Host "=== Deploiement Docker Hub - Backend + Frontend ===" -ForegroundColor Blue
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  - Tag: $Tag"
Write-Host "  - Docker Username: $DockerUsername"
Write-Host "  - Images a creer:"
Write-Host "    • $DockerUsername/cuisine-backend:$Tag"
Write-Host "    • $DockerUsername/cuisine-frontend:$Tag"
Write-Host ""

# Verifier Docker
Write-Host "1. Verification Docker..." -ForegroundColor Cyan
try {
    docker version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR: Docker n'est pas demarre" -ForegroundColor Red
        exit 1
    }
    Write-Host "OK: Docker est fonctionnel" -ForegroundColor Green
} catch {
    Write-Host "ERREUR Docker: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Build Backend
Write-Host "2. Construction Backend..." -ForegroundColor Cyan
$buildResult = docker build -f backend/Dockerfile.test -t "$DockerUsername/cuisine-backend:$Tag" backend/
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Backend construit avec succes" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Echec backend" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Build Frontend
Write-Host "3. Construction Frontend..." -ForegroundColor Cyan
$buildResult = docker build -f frontend2/Dockerfile.simple -t "$DockerUsername/cuisine-frontend:$Tag" frontend2/
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Frontend construit avec succes" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Echec frontend" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Tests des images
Write-Host "4. Tests des images..." -ForegroundColor Cyan
Write-Host "Test backend..."
$testBackend = docker run --rm "$DockerUsername/cuisine-backend:$Tag" node --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Backend teste - Node.js $testBackend" -ForegroundColor Green
}

Write-Host "Test frontend..."
$testFrontend = docker run --rm "$DockerUsername/cuisine-frontend:$Tag" node --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Frontend teste - Node.js $testFrontend" -ForegroundColor Green
}
Write-Host ""

# Afficher la taille des images
Write-Host "5. Taille des images:" -ForegroundColor Cyan
docker images | Select-String "$DockerUsername/cuisine"
Write-Host ""

# Demander confirmation
Write-Host "=== PRET POUR PUBLICATION ===" -ForegroundColor Yellow
$confirm = Read-Host "Voulez-vous publier ces images sur Docker Hub? (o/N)"
if ($confirm -ne "o" -and $confirm -ne "O") {
    Write-Host "Publication annulee - Images disponibles localement" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour tester localement:" -ForegroundColor Blue
    Write-Host "  docker run -p 5000:5000 $DockerUsername/cuisine-backend:$Tag"
    Write-Host "  docker run -p 3000:3000 $DockerUsername/cuisine-frontend:$Tag"
    exit 0
}

# Publication Backend
Write-Host ""
Write-Host "6. Publication Backend..." -ForegroundColor Cyan
$pushResult = docker push "$DockerUsername/cuisine-backend:$Tag"
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Backend publie avec succes" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Echec publication backend" -ForegroundColor Red
    Write-Host "INFO: Verifiez docker login" -ForegroundColor Yellow
    exit 1
}

# Publication Frontend
Write-Host ""
Write-Host "7. Publication Frontend..." -ForegroundColor Cyan
$pushResult = docker push "$DockerUsername/cuisine-frontend:$Tag"
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Frontend publie avec succes" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Echec publication frontend" -ForegroundColor Red
    exit 1
}

# Success final
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "    DEPLOYMENT DOCKER HUB REUSSI     " -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Images publiees:" -ForegroundColor Blue
Write-Host "  Backend:  https://hub.docker.com/r/$DockerUsername/cuisine-backend"
Write-Host "  Frontend: https://hub.docker.com/r/$DockerUsername/cuisine-frontend"
Write-Host ""
Write-Host "Commandes pour utiliser:" -ForegroundColor Blue
Write-Host "  docker pull $DockerUsername/cuisine-backend:$Tag"
Write-Host "  docker pull $DockerUsername/cuisine-frontend:$Tag"
Write-Host ""
Write-Host "Demarrage rapide:" -ForegroundColor Blue
Write-Host "  docker run -d -p 5000:5000 --name backend $DockerUsername/cuisine-backend:$Tag"
Write-Host "  docker run -d -p 3000:3000 --name frontend $DockerUsername/cuisine-frontend:$Tag"
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "  1. Mettre a jour docker-compose.prod.yml"
Write-Host "  2. Configurer les secrets GitHub (DOCKERHUB_USERNAME, DOCKERHUB_TOKEN)"
Write-Host "  3. Push du code pour declencher CI/CD automatique"
Write-Host ""
Write-Host "FELICITATIONS ! Votre application est sur Docker Hub !" -ForegroundColor Magenta
