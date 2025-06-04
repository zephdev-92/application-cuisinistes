# Script de commit assisté avec validation
# Usage: .\commit.ps1

Write-Host "💬 Assistant de commit" -ForegroundColor Green
Write-Host ""

# Vérifier s'il y a des changements à commiter
$gitStatus = git status --porcelain
if (-not $gitStatus) {
    Write-Host "❌ Aucun changement à commiter" -ForegroundColor Red
    Write-Host "Utilisez 'git add .' pour ajouter vos fichiers d'abord" -ForegroundColor Yellow
    exit 1
}

# Afficher les fichiers modifiés
Write-Host "📁 Fichiers à commiter:" -ForegroundColor Blue
git status --short

Write-Host ""

# Afficher les types disponibles
Write-Host "Types disponibles:" -ForegroundColor Yellow
Write-Host "1) feat     ✨ - Nouvelle fonctionnalité" -ForegroundColor Cyan
Write-Host "2) fix      🐛 - Correction de bug" -ForegroundColor Red
Write-Host "3) docs     📝 - Documentation" -ForegroundColor Blue
Write-Host "4) style    💄 - Style/formatage" -ForegroundColor Magenta
Write-Host "5) refactor ♻️  - Refactoring" -ForegroundColor Green
Write-Host "6) test     ✅ - Tests" -ForegroundColor Gray
Write-Host "7) chore    🔧 - Maintenance" -ForegroundColor DarkYellow
Write-Host "8) perf     ⚡ - Performance" -ForegroundColor Yellow
Write-Host "9) ci       👷 - CI/CD" -ForegroundColor DarkCyan
Write-Host "10) build   📦 - Build" -ForegroundColor DarkBlue
Write-Host ""

# Demander les informations
$typeChoice = Read-Host "Choisir le type (1-10)"
$scope = Read-Host "Scope (optionnel, ex: auth, api, ui)"
$description = Read-Host "Description courte (mode impératif)"

# Mapper le choix au type
switch ($typeChoice) {
    "1" { $type = "feat"; $emoji = "✨" }
    "2" { $type = "fix"; $emoji = "🐛" }
    "3" { $type = "docs"; $emoji = "📝" }
    "4" { $type = "style"; $emoji = "💄" }
    "5" { $type = "refactor"; $emoji = "♻️" }
    "6" { $type = "test"; $emoji = "✅" }
    "7" { $type = "chore"; $emoji = "🔧" }
    "8" { $type = "perf"; $emoji = "⚡" }
    "9" { $type = "ci"; $emoji = "👷" }
    "10" { $type = "build"; $emoji = "📦" }
    default {
        Write-Host "❌ Type invalide" -ForegroundColor Red
        exit 1
    }
}

# Construire le message de commit
if ($scope) {
    $commitMsg = "$type($scope): $description"
} else {
    $commitMsg = "$type: $description"
}

# Validations
if ($commitMsg.Length -gt 50) {
    Write-Host "❌ Message trop long (max 50 caractères)" -ForegroundColor Red
    Write-Host "Message: $commitMsg ($($commitMsg.Length) caractères)" -ForegroundColor Yellow
    exit 1
}

if ($description -cmatch "^[A-Z]") {
    Write-Host "❌ La description doit commencer par une minuscule" -ForegroundColor Red
    Write-Host "Reçu: $description" -ForegroundColor Yellow
    exit 1
}

if ($description.EndsWith(".")) {
    Write-Host "❌ La description ne doit pas se terminer par un point" -ForegroundColor Red
    Write-Host "Reçu: $description" -ForegroundColor Yellow
    exit 1
}

# Vérifier le mode impératif (basique)
$pastTenseWords = @("added", "fixed", "updated", "changed", "removed", "deleted")
foreach ($word in $pastTenseWords) {
    if ($description.ToLower().StartsWith($word)) {
        Write-Host "❌ Utilisez le mode impératif (ex: 'add' au lieu de 'added')" -ForegroundColor Red
        Write-Host "Mot détecté: $word" -ForegroundColor Yellow
        exit 1
    }
}

# Afficher un aperçu
Write-Host ""
Write-Host "📝 Aperçu du commit:" -ForegroundColor Blue
Write-Host "$emoji $commitMsg" -ForegroundColor White
Write-Host ""

# Demander confirmation
$confirm = Read-Host "Confirmer le commit ? (y/N)"

if ($confirm -eq "y" -or $confirm -eq "Y") {
    try {
        git commit -m $commitMsg
        Write-Host ""
        Write-Host "✅ Commit créé avec succès!" -ForegroundColor Green
        Write-Host "$emoji $commitMsg" -ForegroundColor White

        # Suggestions pour la suite
        Write-Host ""
        Write-Host "💡 Prochaines étapes suggérées:" -ForegroundColor Blue
        Write-Host "  • git push origin $(git branch --show-current)" -ForegroundColor White
        Write-Host "  • Créer une PR vers 'dev' si prêt" -ForegroundColor White
    }
    catch {
        Write-Host "❌ Erreur lors du commit: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Commit annulé" -ForegroundColor Yellow
}
