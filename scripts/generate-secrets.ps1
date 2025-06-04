# Script de generation automatique des secrets de production (Windows PowerShell)
# Usage: .\generate-secrets.ps1

Write-Host "Generation des secrets de production" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Ces secrets sont pour la PRODUCTION uniquement" -ForegroundColor Red
Write-Host "NE les commitez JAMAIS dans Git !" -ForegroundColor Red
Write-Host "Copiez-les dans GitHub > Settings > Secrets and variables > Actions" -ForegroundColor Yellow
Write-Host ""

# Fonction pour generer des secrets aleatoires
function Generate-RandomSecret {
    param([int]$Length = 32)
    $Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    $Result = ""
    for ($i = 0; $i -lt $Length; $i++) {
        $Result += $Characters[(Get-Random -Maximum $Characters.Length)]
    }
    return $Result
}

function Generate-RandomString {
    param([int]$Length = 20)
    $Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    $Result = ""
    for ($i = 0; $i -lt $Length; $i++) {
        $Result += $Characters[(Get-Random -Maximum $Characters.Length)]
    }
    return $Result
}

Write-Host "JWT et securite:" -ForegroundColor Blue
$jwtSecret = Generate-RandomSecret -Length 64
Write-Host "JWT_SECRET=$jwtSecret"
Write-Host "JWT_EXPIRES_IN=7d"
Write-Host "BCRYPT_SALT_ROUNDS=12"
Write-Host ""

Write-Host "MongoDB:" -ForegroundColor Blue
Write-Host "MONGO_ROOT_USER=admin"
$mongoRootPassword = Generate-RandomSecret -Length 32
Write-Host "MONGO_ROOT_PASSWORD=$mongoRootPassword"
Write-Host "MONGO_APP_USER=app_user"
$mongoAppPassword = Generate-RandomSecret -Length 32
Write-Host "MONGO_APP_PASSWORD=$mongoAppPassword"
Write-Host "MONGO_DATABASE=cuisine-app"
Write-Host "MONGODB_URI=mongodb://app_user:$mongoAppPassword@mongo:27017/cuisine-app?authSource=cuisine-app"
Write-Host ""

Write-Host "Redis:" -ForegroundColor Blue
$redisPassword = Generate-RandomSecret -Length 32
Write-Host "REDIS_PASSWORD=$redisPassword"
Write-Host ""

Write-Host "MinIO:" -ForegroundColor Blue
$minioAccessKey = Generate-RandomString -Length 20
$minioSecretKey = Generate-RandomString -Length 40
Write-Host "MINIO_ACCESS_KEY=$minioAccessKey"
Write-Host "MINIO_SECRET_KEY=$minioSecretKey"
Write-Host "MINIO_BUCKET_NAME=cuisine-files"
Write-Host ""

Write-Host "Limites de securite (configuration):" -ForegroundColor Blue
Write-Host "RATE_LIMIT_WINDOW_MS=900000"
Write-Host "RATE_LIMIT_MAX_REQUESTS=100"
Write-Host "MAX_FILE_SIZE=10485760"
Write-Host ""

Write-Host "Docker Hub (a configurer manuellement):" -ForegroundColor Blue
Write-Host "DOCKER_USERNAME=votre-username-dockerhub"
Write-Host "DOCKER_PASSWORD=dckr_pat_VOTRE_TOKEN_DOCKERHUB"
Write-Host ""

Write-Host "Secrets generes avec succes !" -ForegroundColor Green
Write-Host ""
Write-Host "ETAPES SUIVANTES:" -ForegroundColor Yellow
Write-Host "1. Copiez chaque secret dans GitHub > Settings > Secrets and variables > Actions"
Write-Host "2. Configurez votre compte Docker Hub et generez un access token"
Write-Host "3. Testez le deploiement: git push origin main"
Write-Host ""
Write-Host "SECURITE: Fermez ce terminal apres usage pour eviter l'exposition des secrets !" -ForegroundColor Red
