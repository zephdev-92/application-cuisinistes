# 🔐 Configuration des Secrets GitHub pour le Déploiement

Ce guide vous explique comment configurer tous les secrets nécessaires pour le déploiement automatique de l'application Cuisinistes.

## 📋 Prérequis

- Accès administrateur au repository GitHub
- Compte Docker Hub
- Serveur de production configuré
- Certificats SSL (Let's Encrypt recommandé)

## 🎯 Liste des Secrets Requis

### 1. 🐳 Docker Hub

Accédez à `Settings > Secrets and variables > Actions` dans votre repository GitHub et ajoutez :

```
DOCKER_USERNAME
DOCKER_PASSWORD
```

**Configuration :**
1. Connectez-vous à [Docker Hub](https://hub.docker.com/)
2. Allez dans `Account Settings > Security`
3. Créez un `Access Token`
4. Utilisez votre username Docker Hub pour `DOCKER_USERNAME`
5. Utilisez le token généré pour `DOCKER_PASSWORD`

### 2. 🗄️ Base de Données

```
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=VotreMotDePasseAdminMongo!@#$%
MONGO_APP_USER=app_user
MONGO_APP_PASSWORD=VotreMotDePasseAppMongo!@#$%
MONGO_DATABASE=cuisine-app
MONGODB_URI=mongodb://app_user:VotreMotDePasseAppMongo!@#$%@mongo:27017/cuisine-app?authSource=cuisine-app
```

### 3. 🔐 Sécurité JWT

```
JWT_SECRET=VotreJWTSecretTresSecurise64Caracteres!@#$%^&*()_+
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
```

**Générer un JWT Secret :**
```bash
# Méthode 1: OpenSSL
openssl rand -base64 64

# Méthode 2: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Méthode 3: En ligne
# Utilisez un générateur en ligne sécurisé
```

### 4. 🗃️ Redis

```
REDIS_PASSWORD=VotreMotDePasseRedisSecurise!@#$%
```

### 5. 📁 Stockage MinIO

```
MINIO_ACCESS_KEY=VotreMinIOAccessKey123
MINIO_SECRET_KEY=VotreMinIOSecretKeyTresSecurise456
MINIO_BUCKET_NAME=cuisine-files
```

### 6. 📧 Configuration Email

```
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=noreply@votre-domaine.com
EMAIL_PASS=VotreMotDePasseEmailSecurise
```

### 7. 🌐 Déploiement

```
DEPLOY_HOST=votre-serveur.com
DEPLOY_USER=deployer
DEPLOY_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
...votre clé SSH privée complète...
-----END OPENSSH PRIVATE KEY-----
DOMAIN_NAME=votre-domaine.com
```

### 8. 🛡️ Sécurité

```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
```

## 🔧 Configuration Étape par Étape

### Étape 1: Accéder aux Secrets GitHub

1. Allez sur votre repository GitHub
2. Cliquez sur `Settings`
3. Dans la sidebar, cliquez sur `Secrets and variables`
4. Sélectionnez `Actions`

### Étape 2: Ajouter les Secrets

Pour chaque secret :

1. Cliquez sur `New repository secret`
2. Entrez le nom du secret (ex: `JWT_SECRET`)
3. Entrez la valeur du secret
4. Cliquez sur `Add secret`

### Étape 3: Secrets d'Environnement (Recommandé)

Pour une meilleure organisation, créez des environnements :

1. Allez dans `Settings > Environments`
2. Créez l'environnement `production`
3. Ajoutez les secrets spécifiques à la production

## 🔑 Génération des Secrets

### JWT Secret

```bash
# Générer un secret JWT fort
openssl rand -base64 64
```

### Mots de Passe

```bash
# Générer un mot de passe sécurisé
openssl rand -base64 32
```

### Clé SSH pour le Déploiement

```bash
# Générer une paire de clés SSH
ssh-keygen -t ed25519 -C "deploy@cuisine-app" -f deploy_key

# La clé publique va sur le serveur
cat deploy_key.pub

# La clé privée va dans DEPLOY_SSH_KEY
cat deploy_key
```

## 🌍 Variables d'Environnement par Environnement

### Production
```
NODE_ENV=production
LOG_LEVEL=info
```

### Staging
```
NODE_ENV=staging
LOG_LEVEL=debug
```

## 🔐 Bonnes Pratiques de Sécurité

### 1. Rotation des Secrets

- 🔄 Changez les mots de passe tous les 90 jours
- 🔄 Générez de nouveaux JWT secrets régulièrement
- 🔄 Renouvelez les certificats SSL avant expiration

### 2. Accès Restreint

- 👥 Limitez l'accès aux secrets aux personnes nécessaires
- 🔐 Utilisez l'authentification 2FA sur GitHub
- 📝 Loggez tous les accès aux secrets

### 3. Monitoring

- 📊 Surveillez les tentatives d'accès aux secrets
- 🚨 Configurez des alertes pour les échecs de déploiement
- 📈 Monitorer l'utilisation des ressources

### 4. Backup et Récupération

- 💾 Sauvegardez vos secrets dans un gestionnaire de mots de passe
- 🔄 Documentez les procédures de récupération
- 🧪 Testez régulièrement les sauvegardes

## 🧪 Test de Configuration

### Script de Validation

```bash
#!/bin/bash
# Vérifier que tous les secrets sont configurés

REQUIRED_SECRETS=(
    "DOCKER_USERNAME"
    "DOCKER_PASSWORD"
    "JWT_SECRET"
    "MONGODB_URI"
    "REDIS_PASSWORD"
    "MINIO_ACCESS_KEY"
    "MINIO_SECRET_KEY"
    "DEPLOY_HOST"
    "DEPLOY_SSH_KEY"
)

echo "🔍 Vérification des secrets GitHub..."

for secret in "${REQUIRED_SECRETS[@]}"; do
    if gh secret list | grep -q "$secret"; then
        echo "✅ $secret: Configuré"
    else
        echo "❌ $secret: MANQUANT"
    fi
done
```

### Test de Déploiement

1. **Push sur une branche de test**
   ```bash
   git checkout -b test-deploy
   git push origin test-deploy
   ```

2. **Vérifier le workflow GitHub Actions**
   - Allez dans l'onglet `Actions`
   - Vérifiez que le workflow s'exécute sans erreur

3. **Test de l'API déployée**
   ```bash
   curl https://votre-domaine.com/health
   ```

## 🚨 Dépannage

### Erreurs Communes

1. **Secret mal formaté**
   - Vérifiez qu'il n'y a pas d'espaces en début/fin
   - Pour les clés SSH, copiez le contenu exact du fichier

2. **Permissions insuffisantes**
   - Vérifiez les droits sur le repository
   - Confirmez l'accès aux secrets

3. **Caractères spéciaux**
   - Échappez les caractères spéciaux dans les mots de passe
   - Utilisez des guillemets si nécessaire

### Logs de Debug

```bash
# Activer les logs détaillés dans GitHub Actions
ACTIONS_STEP_DEBUG=true
ACTIONS_RUNNER_DEBUG=true
```

## 📞 Support

En cas de problème :

1. 📖 Consultez la documentation GitHub Actions
2. 🔍 Vérifiez les logs dans l'onglet Actions
3. 💬 Contactez l'équipe DevOps
4. 📧 Créez une issue dans le repository

---

⚠️ **Important :** Ne jamais stocker de secrets dans le code source ou les logs. Toujours utiliser les GitHub Secrets pour les informations sensibles.
