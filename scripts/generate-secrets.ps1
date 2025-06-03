# 🔐 Script de Génération de Secrets Sécurisés
# Pour Windows PowerShell

param(
    [string]$Type = "all",
    [switch]$Help
)

# Couleurs pour l'affichage
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-ColorOutput($ForegroundColor, $Message) {
    Write-Host $Message -ForegroundColor $ForegroundColor
}

function Show-Help {
    Write-ColorOutput $Blue "=============================================="
    Write-ColorOutput $Blue "  🔐 GÉNÉRATEUR DE SECRETS SÉCURISÉS"
    Write-ColorOutput $Blue "=============================================="
    Write-Host ""
    Write-Host "Usage: .\generate-secrets.ps1 [-Type type] [-Help]"
    Write-Host ""
    Write-Host "Types disponibles:"
    Write-Host "  all       - Générer tous les secrets (défaut)"
    Write-Host "  jwt       - Secret JWT uniquement"
    Write-Host "  password  - Mot de passe sécurisé"
    Write-Host "  mongo     - Secrets MongoDB"
    Write-Host "  redis     - Secret Redis"
    Write-Host "  minio     - Secrets MinIO"
    Write-Host ""
    Write-Host "Exemples:"
    Write-Host "  .\generate-secrets.ps1"
    Write-Host "  .\generate-secrets.ps1 -Type jwt"
    Write-Host "  .\generate-secrets.ps1 -Type password"
    exit
}

function Generate-SecureString($Length = 32) {
    $Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    $Random = New-Object System.Random
    $Result = ""

    for ($i = 0; $i -lt $Length; $i++) {
        $Result += $Characters[$Random.Next($Characters.Length)]
    }

    return $Result
}

function Generate-JWTSecret {
    Write-ColorOutput $Blue "🔐 JWT SECRET"
    Write-Host "----------------------------------------"

    # Méthode 1: Utiliser System.Security.Cryptography
    try {
        $bytes = New-Object byte[] 64
        $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        $rng.GetBytes($bytes)
        $secret = [Convert]::ToBase64String($bytes)

        Write-ColorOutput $Green "JWT_SECRET=$secret"
        Write-Host ""
    }
    catch {
        # Fallback: Générer manuellement
        $secret = Generate-SecureString 64
        Write-ColorOutput $Green "JWT_SECRET=$secret"
        Write-Host ""
    }
}

function Generate-Password($Name, $Length = 32) {
    $password = Generate-SecureString $Length
    Write-ColorOutput $Green "$Name=$password"
}

function Generate-MongoSecrets {
    Write-ColorOutput $Blue "🗄️  MONGODB SECRETS"
    Write-Host "----------------------------------------"

    $rootPassword = Generate-SecureString 32
    $appPassword = Generate-SecureString 32

    Write-ColorOutput $Green "MONGO_ROOT_USER=admin"
    Write-ColorOutput $Green "MONGO_ROOT_PASSWORD=$rootPassword"
    Write-ColorOutput $Green "MONGO_APP_USER=app_user"
    Write-ColorOutput $Green "MONGO_APP_PASSWORD=$appPassword"
    Write-ColorOutput $Green "MONGO_DATABASE=cuisine-app"
    Write-ColorOutput $Green "MONGODB_URI=mongodb://app_user:$appPassword@mongo:27017/cuisine-app?authSource=cuisine-app"
    Write-Host ""
}

function Generate-RedisSecrets {
    Write-ColorOutput $Blue "🗃️  REDIS SECRETS"
    Write-Host "----------------------------------------"

    Generate-Password "REDIS_PASSWORD" 32
    Write-Host ""
}

function Generate-MinIOSecrets {
    Write-ColorOutput $Blue "📁 MINIO SECRETS"
    Write-Host "----------------------------------------"

    Generate-Password "MINIO_ACCESS_KEY" 20
    Generate-Password "MINIO_SECRET_KEY" 40
    Write-ColorOutput $Green "MINIO_BUCKET_NAME=cuisine-files"
    Write-Host ""
}

function Generate-SecuritySecrets {
    Write-ColorOutput $Blue "🛡️  SECURITY SECRETS"
    Write-Host "----------------------------------------"

    Write-ColorOutput $Green "JWT_EXPIRES_IN=7d"
    Write-ColorOutput $Green "BCRYPT_SALT_ROUNDS=12"
    Write-ColorOutput $Green "RATE_LIMIT_WINDOW_MS=900000"
    Write-ColorOutput $Green "RATE_LIMIT_MAX_REQUESTS=100"
    Write-ColorOutput $Green "MAX_FILE_SIZE=10485760"
    Write-Host ""
}

function Show-Instructions {
    Write-ColorOutput $Blue "📋 INSTRUCTIONS D'UTILISATION"
    Write-Host "=============================================="
    Write-Host ""
    Write-ColorOutput $Yellow "1. Copiez les secrets générés ci-dessus"
    Write-ColorOutput $Yellow "2. Allez sur GitHub: Settings > Secrets and variables > Actions"
    Write-ColorOutput $Yellow "3. Cliquez 'New repository secret'"
    Write-ColorOutput $Yellow "4. Ajoutez chaque secret un par un"
    Write-Host ""
    Write-ColorOutput $Blue "📚 Documentation complète:"
    Write-Host "   • docs/GITHUB_SECRETS_SETUP.md"
    Write-Host "   • README_DEPLOYMENT.md"
    Write-Host ""
    Write-ColorOutput $Green "✨ Votre configuration sera sécurisée!"
}

# Script principal
if ($Help) {
    Show-Help
}

Write-ColorOutput $Blue "=============================================="
Write-ColorOutput $Blue "  🔐 GÉNÉRATION DE SECRETS SÉCURISÉS"
Write-ColorOutput $Blue "=============================================="
Write-Host ""

switch ($Type.ToLower()) {
    "jwt" {
        Generate-JWTSecret
    }
    "password" {
        Write-ColorOutput $Blue "🔑 MOT DE PASSE SÉCURISÉ"
        Write-Host "----------------------------------------"
        Generate-Password "SECURE_PASSWORD" 32
        Write-Host ""
    }
    "mongo" {
        Generate-MongoSecrets
    }
    "redis" {
        Generate-RedisSecrets
    }
    "minio" {
        Generate-MinIOSecrets
    }
    "all" {
        Generate-JWTSecret
        Generate-MongoSecrets
        Generate-RedisSecrets
        Generate-MinIOSecrets
        Generate-SecuritySecrets

        Write-ColorOutput $Blue "📧 EMAIL SECRETS (Optionnel)"
        Write-Host "----------------------------------------"
        Write-ColorOutput $Yellow "EMAIL_HOST=smtp.gmail.com"
        Write-ColorOutput $Yellow "EMAIL_PORT=587"
        Write-ColorOutput $Yellow "EMAIL_USER=noreply@votre-domaine.com"
        Write-ColorOutput $Yellow "EMAIL_PASS=VotreMotDePasseEmailApp"
        Write-Host ""

        Write-ColorOutput $Blue "🌐 DEPLOYMENT SECRETS (Production)"
        Write-Host "----------------------------------------"
        Write-ColorOutput $Yellow "DEPLOY_HOST=votre-serveur.com"
        Write-ColorOutput $Yellow "DEPLOY_USER=deployer"
        Write-ColorOutput $Yellow "DOMAIN_NAME=votre-domaine.com"
        Write-Host ""

        Write-ColorOutput $Blue "🐳 DOCKER SECRETS (Requis)"
        Write-Host "----------------------------------------"
        Write-ColorOutput $Yellow "DOCKER_USERNAME=votre-username-dockerhub"
        Write-ColorOutput $Yellow "DOCKER_PASSWORD=votre-token-dockerhub"
        Write-Host ""
    }
    default {
        Write-ColorOutput $Red "❌ Type de secret inconnu: $Type"
        Write-Host "Utilisez -Help pour voir les types disponibles"
        exit 1
    }
}

Show-Instructions
