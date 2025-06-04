# Script de création de branche avec validation
# Usage: .\create-branch.ps1

Write-Host "🌿 Création d'une nouvelle branche" -ForegroundColor Green
Write-Host ""

# Afficher les types disponibles
Write-Host "Types disponibles:" -ForegroundColor Yellow
Write-Host "1) feature  - Nouvelle fonctionnalité" -ForegroundColor Cyan
Write-Host "2) fix      - Correction de bug" -ForegroundColor Cyan
Write-Host "3) hotfix   - Correction urgente" -ForegroundColor Red
Write-Host "4) refactor - Refactoring" -ForegroundColor Magenta
Write-Host "5) docs     - Documentation" -ForegroundColor Blue
Write-Host "6) test     - Tests" -ForegroundColor Gray
Write-Host "7) chore    - Maintenance" -ForegroundColor DarkYellow
Write-Host ""

# Demander le type
$typeChoice = Read-Host "Choisir le type (1-7)"
$description = Read-Host "Description (ex: user-authentication)"

# Mapper le choix au type
switch ($typeChoice) {
    "1" { $type = "feature" }
    "2" { $type = "fix" }
    "3" { $type = "hotfix" }
    "4" { $type = "refactor" }
    "5" { $type = "docs" }
    "6" { $type = "test" }
    "7" { $type = "chore" }
    default {
        Write-Host "❌ Type invalide" -ForegroundColor Red
        exit 1
    }
}

$branchName = "$type/$description"

# Validation du nom de branche
if ($branchName -notmatch "^[a-z]+/[a-z0-9\-]+$") {
    Write-Host "❌ Nom de branche invalide" -ForegroundColor Red
    Write-Host "Utilisez uniquement des minuscules et des tirets" -ForegroundColor Yellow
    exit 1
}

if ($branchName.Length -gt 50) {
    Write-Host "❌ Nom trop long (max 50 caractères)" -ForegroundColor Red
    Write-Host "Longueur actuelle: $($branchName.Length)" -ForegroundColor Yellow
    exit 1
}

# Vérifier si la branche existe déjà
$existingBranch = git branch --list $branchName
if ($existingBranch) {
    Write-Host "❌ La branche '$branchName' existe déjà" -ForegroundColor Red
    exit 1
}

# Créer et basculer sur la branche
try {
    git checkout -b $branchName
    Write-Host "✅ Branche créée et activée: $branchName" -ForegroundColor Green

    # Afficher des conseils
    Write-Host ""
    Write-Host "💡 Conseils pour cette branche:" -ForegroundColor Blue
    Write-Host "  • Faire des commits fréquents avec des messages clairs" -ForegroundColor White
    Write-Host "  • Utiliser le format: type(scope): description" -ForegroundColor White
    Write-Host "  • Tester localement avant de push" -ForegroundColor White
    Write-Host "  • Créer une PR vers 'dev' quand prêt" -ForegroundColor White
}
catch {
    Write-Host "❌ Erreur lors de la création de la branche: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
