@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ==============================================
echo   GENERATEUR DE SECRETS SECURISES
echo ==============================================
echo.

:: Fonction pour générer un string aléatoire
call :GenerateRandom jwtSecret 64
call :GenerateRandom mongoRootPass 32
call :GenerateRandom mongoAppPass 32
call :GenerateRandom redisPass 32
call :GenerateRandom minioAccess 20
call :GenerateRandom minioSecret 40

echo JWT SECRET
echo ----------------------------------------
echo JWT_SECRET=%jwtSecret%
echo JWT_EXPIRES_IN=7d
echo BCRYPT_SALT_ROUNDS=12
echo.

echo MONGODB SECRETS
echo ----------------------------------------
echo MONGO_ROOT_USER=admin
echo MONGO_ROOT_PASSWORD=%mongoRootPass%
echo MONGO_APP_USER=app_user
echo MONGO_APP_PASSWORD=%mongoAppPass%
echo MONGO_DATABASE=cuisine-app
echo MONGODB_URI=mongodb://app_user:%mongoAppPass%@mongo:27017/cuisine-app?authSource=cuisine-app
echo.

echo REDIS SECRETS
echo ----------------------------------------
echo REDIS_PASSWORD=%redisPass%
echo.

echo MINIO SECRETS
echo ----------------------------------------
echo MINIO_ACCESS_KEY=%minioAccess%
echo MINIO_SECRET_KEY=%minioSecret%
echo MINIO_BUCKET_NAME=cuisine-files
echo.

echo SECURITY SECRETS
echo ----------------------------------------
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_REQUESTS=100
echo MAX_FILE_SIZE=10485760
echo.

echo DOCKER SECRETS (A completer)
echo ----------------------------------------
echo DOCKER_USERNAME=votre-username-dockerhub
echo DOCKER_PASSWORD=votre-token-dockerhub
echo.

echo EMAIL SECRETS (Optionnel)
echo ----------------------------------------
echo EMAIL_HOST=smtp.gmail.com
echo EMAIL_PORT=587
echo EMAIL_USER=noreply@votre-domaine.com
echo EMAIL_PASS=VotreMotDePasseEmailApp
echo.

echo INSTRUCTIONS
echo ==============================================
echo.
echo 1. Copiez les secrets generes ci-dessus
echo 2. Allez sur GitHub: Settings ^> Secrets and variables ^> Actions
echo 3. Cliquez 'New repository secret'
echo 4. Ajoutez chaque secret un par un
echo.
echo Documentation: docs/GITHUB_SECRETS_SETUP.md
echo.
echo Votre configuration sera securisee!
echo.

pause
goto :eof

:GenerateRandom
setlocal
set "chars=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
set "length=%2"
set "result="

for /l %%i in (1,1,%length%) do (
    set /a "rand=!random! %% 62"
    for %%j in (!rand!) do (
        set "result=!result!!chars:~%%j,1!"
    )
)

endlocal & set "%1=%result%"
goto :eof
