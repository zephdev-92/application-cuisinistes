# Script de test Docker Hub - Backend seulement
# Usage: .\docker-hub-test-backend.ps1 [tag] [username]

param(
    [string]$Tag = "test",
    [string]$DockerUsername = "zephdev92"
)

Write-Host "Test Docker Hub - Backend seulement" -ForegroundColor Blue
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  - Tag: $Tag"
Write-Host "  - Docker Username: $DockerUsername"
Write-Host "  - Image a creer: $DockerUsername/cuisine-backend:$Tag"
Write-Host ""

# Verifier Docker
Write-Host "Verification Docker..." -ForegroundColor Cyan
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

# Build de l'image backend
Write-Host "Construction de l'image backend..." -ForegroundColor Cyan
$buildResult = docker build -f backend/Dockerfile.test -t "$DockerUsername/cuisine-backend:$Tag" backend/
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Image backend construite avec succes" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Echec de la construction de l'image backend" -ForegroundColor Red
    exit 1
}

# Test de l'image
Write-Host "Test de l'image..." -ForegroundColor Cyan
$testResult = docker run --rm "$DockerUsername/cuisine-backend:$Tag" node --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Test de l'image reussi" -ForegroundColor Green
    Write-Host "Version Node.js: $testResult"
} else {
    Write-Host "ATTENTION: Test de l'image echoue mais on continue" -ForegroundColor Yellow
}

# Demander confirmation
$confirm = Read-Host "Voulez-vous publier cette image sur Docker Hub? (o/N)"
if ($confirm -ne "o" -and $confirm -ne "O") {
    Write-Host "Publication annulee" -ForegroundColor Yellow
    exit 0
}

# Push vers Docker Hub
Write-Host "Publication vers Docker Hub..." -ForegroundColor Cyan
$pushResult = docker push "$DockerUsername/cuisine-backend:$Tag"
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Image publiee avec succes !" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Echec de la publication" -ForegroundColor Red
    Write-Host "INFO: Verifiez que vous etes connecte: docker login" -ForegroundColor Yellow
    exit 1
}

# Informations finales
Write-Host ""
Write-Host "Test Docker Hub termine avec succes !" -ForegroundColor Green
Write-Host ""
Write-Host "Image publiee:" -ForegroundColor Blue
Write-Host "  • https://hub.docker.com/r/$DockerUsername/cuisine-backend"
Write-Host ""
Write-Host "Pour utiliser votre image:" -ForegroundColor Blue
Write-Host "  docker pull $DockerUsername/cuisine-backend:$Tag"
Write-Host "  docker run -p 5000:5000 $DockerUsername/cuisine-backend:$Tag"
Write-Host ""
Write-Host "Felicitations ! Votre premiere image est sur Docker Hub !" -ForegroundColor Magenta
