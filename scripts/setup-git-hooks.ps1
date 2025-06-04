# Script de configuration des hooks Git
# Usage: .\setup-git-hooks.ps1

Write-Host "Configuration des hooks Git" -ForegroundColor Green
Write-Host ""

# Verifier si on est dans un repo Git
if (-not (Test-Path ".git")) {
    Write-Host "Ce dossier n'est pas un repository Git" -ForegroundColor Red
    exit 1
}

# Creer le dossier hooks s'il n'existe pas
$hooksDir = ".git\hooks"
if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
}

Write-Host "Creation du hook commit-msg..." -ForegroundColor Blue

# Creer le hook commit-msg (Windows batch)
$commitMsgHook = @"
@echo off
REM Hook Git pour valider les messages de commit

set "commit_file=%1"
set /p commit_message=<"%commit_file%"

REM Regex simplifiee pour Windows batch
echo %commit_message% | findstr /R "^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)" >nul
if errorlevel 1 (
    echo.
    echo [91mCOMMIT REJETE[0m
    echo [93mFormat requis: type(scope): description[0m
    echo [93mTypes autorises: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert[0m
    echo.
    echo [93mExemples valides:[0m
    echo   feat(auth^): add user authentication
    echo   fix(api^): resolve validation error
    echo   docs(readme^): update installation guide
    echo.
    exit 1
)

REM Verifier la longueur (approximative)
if "%commit_message:~50,1%" neq "" (
    echo.
    echo [91mCOMMIT REJETE[0m
    echo [93mMessage trop long (max 50 caracteres)[0m
    echo.
    exit 1
)

echo [92mCommit valide selon les conventions[0m
exit 0
"@

$commitMsgHook | Out-File -FilePath "$hooksDir\commit-msg.bat" -Encoding ascii

Write-Host "Creation du hook pre-push..." -ForegroundColor Blue

# Creer le hook pre-push (Windows batch)
$prePushHook = @"
@echo off
REM Hook Git pour valider les noms de branches

for /f %%i in ('git rev-parse --abbrev-ref HEAD') do set current_branch=%%i

REM Permettre main et dev
if "%current_branch%"=="main" exit 0
if "%current_branch%"=="dev" exit 0

REM Verifier le format des autres branches
echo %current_branch% | findstr /R "^(feature|fix|hotfix|refactor|docs|test|chore)/" >nul
if errorlevel 1 (
    echo.
    echo [91mPUSH REJETE[0m
    echo [93mNom de branche invalide: %current_branch%[0m
    echo [93mFormat requis: type/description[0m
    echo [93mTypes autorises: feature, fix, hotfix, refactor, docs, test, chore[0m
    echo.
    echo [93mExemples valides:[0m
    echo   feature/user-authentication
    echo   fix/login-bug
    echo   docs/api-documentation
    echo.
    exit 1
)

echo [92mNom de branche valide[0m
exit 0
"@

$prePushHook | Out-File -FilePath "$hooksDir\pre-push.bat" -Encoding ascii

Write-Host "Configuration des alias Git..." -ForegroundColor Blue

# Configurer les alias Git
try {
    git config alias.cb "!powershell -ExecutionPolicy Bypass -File scripts/create-branch.ps1"
    git config alias.cm "!powershell -ExecutionPolicy Bypass -File scripts/commit.ps1"
    git config alias.validate-commit "!powershell -ExecutionPolicy Bypass -File .git/hooks/commit-msg.bat"

    Write-Host "Alias configures:" -ForegroundColor Green
    Write-Host "  git cb  -> Creer une branche" -ForegroundColor White
    Write-Host "  git cm  -> Commit assiste" -ForegroundColor White
} catch {
    Write-Host "Erreur lors de la configuration des alias: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Configuration terminee!" -ForegroundColor Green
Write-Host ""
Write-Host "Utilisation:" -ForegroundColor Blue
Write-Host "  git cb          -> Creer une nouvelle branche" -ForegroundColor White
Write-Host "  git cm          -> Faire un commit assiste" -ForegroundColor White
Write-Host "  Les hooks valideront automatiquement vos commits et pushs" -ForegroundColor White
Write-Host ""
Write-Host "Test rapide:" -ForegroundColor Blue
Write-Host "  git cb            -> Tester la creation de branche" -ForegroundColor White
Write-Host "  git cm            -> Tester le commit assiste" -ForegroundColor White
