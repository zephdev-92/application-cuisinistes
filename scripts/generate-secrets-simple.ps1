# 🔐 Générateur de Secrets Sécurisés - Version Simple
# Pour Windows PowerShell

Write-Host "=============================================="
Write-Host "  🔐 GÉNÉRATION DE SECRETS SÉCURISÉS" -ForegroundColor Cyan
Write-Host "=============================================="
Write-Host ""

function Generate-SecureString {
    param([int]$Length = 32)

    $Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    $Random = New-Object System.Random
    $Result = ""

    for ($i = 0; $i -lt $Length; $i++) {
        $Result += $Characters[$Random.Next($Characters.Length)]
    }

    return $Result
}

function Generate-JWTSecret {
    try {
        $bytes = New-Object byte[] 64
        $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        $rng.GetBytes($bytes)
        $secret = [Convert]::ToBase64String($bytes)
        return $secret
    }
    catch {
        return Generate-SecureString 64
    }
}

# Génération des secrets
Write-Host "🔐 JWT SECRET" -ForegroundColor Cyan
Write-Host "----------------------------------------"
$jwtSecret = Generate-JWTSecret
Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor Green
Write-Host ""

Write-Host "🗄️  MONGODB SECRETS" -ForegroundColor Cyan
Write-Host "----------------------------------------"
$mongoRootPass = Generate-SecureString 32
$mongoAppPass = Generate-SecureString 32
Write-Host "MONGO_ROOT_USER=admin" -ForegroundColor Green
Write-Host "MONGO_ROOT_PASSWORD=$mongoRootPass" -ForegroundColor Green
Write-Host "MONGO_APP_USER=app_user" -ForegroundColor Green
Write-Host "MONGO_APP_PASSWORD=$mongoAppPass" -ForegroundColor Green
Write-Host "MONGO_DATABASE=cuisine-app" -ForegroundColor Green
Write-Host "MONGODB_URI=mongodb://app_user:$mongoAppPass@mongo:27017/cuisine-app?authSource=cuisine-app" -ForegroundColor Green
Write-Host ""

Write-Host "🗃️  REDIS SECRETS" -ForegroundColor Cyan
Write-Host "----------------------------------------"
$redisPass = Generate-SecureString 32
Write-Host "REDIS_PASSWORD=$redisPass" -ForegroundColor Green
Write-Host ""

Write-Host "📁 MINIO SECRETS" -ForegroundColor Cyan
Write-Host "----------------------------------------"
$minioAccess = Generate-SecureString 20
$minioSecret = Generate-SecureString 40
Write-Host "MINIO_ACCESS_KEY=$minioAccess" -ForegroundColor Green
Write-Host "MINIO_SECRET_KEY=$minioSecret" -ForegroundColor Green
Write-Host "MINIO_BUCKET_NAME=cuisine-files" -ForegroundColor Green
Write-Host ""

Write-Host "🛡️  SECURITY SECRETS" -ForegroundColor Cyan
Write-Host "----------------------------------------"
Write-Host "JWT_EXPIRES_IN=7d" -ForegroundColor Green
Write-Host "BCRYPT_SALT_ROUNDS=12" -ForegroundColor Green
Write-Host "RATE_LIMIT_WINDOW_MS=900000" -ForegroundColor Green
Write-Host "RATE_LIMIT_MAX_REQUESTS=100" -ForegroundColor Green
Write-Host "MAX_FILE_SIZE=10485760" -ForegroundColor Green
Write-Host ""

Write-Host "🐳 DOCKER SECRETS (À compléter)" -ForegroundColor Cyan
Write-Host "----------------------------------------"
Write-Host "DOCKER_USERNAME=votre-username-dockerhub" -ForegroundColor Yellow
Write-Host "DOCKER_PASSWORD=votre-token-dockerhub" -ForegroundColor Yellow
Write-Host ""

Write-Host "📧 EMAIL SECRETS (Optionnel)" -ForegroundColor Cyan
Write-Host "----------------------------------------"
Write-Host "EMAIL_HOST=smtp.gmail.com" -ForegroundColor Yellow
Write-Host "EMAIL_PORT=587" -ForegroundColor Yellow
Write-Host "EMAIL_USER=noreply@votre-domaine.com" -ForegroundColor Yellow
Write-Host "EMAIL_PASS=VotreMotDePasseEmailApp" -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "=============================================="
Write-Host ""
Write-Host "1. Copiez les secrets générés ci-dessus" -ForegroundColor Yellow
Write-Host "2. Allez sur GitHub: Settings > Secrets and variables > Actions" -ForegroundColor Yellow
Write-Host "3. Cliquez 'New repository secret'" -ForegroundColor Yellow
Write-Host "4. Ajoutez chaque secret un par un" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentation: docs/GITHUB_SECRETS_SETUP.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Votre configuration sera sécurisée!" -ForegroundColor Green
