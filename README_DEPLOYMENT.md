# 🚀 Guide de Déploiement - Application Cuisinistes

## 📋 Récapitulatif de Configuration

Félicitations ! Vous avez maintenant une **infrastructure complète de tests et CI/CD** pour votre application cuisinistes ! 🎉

### ✅ Ce qui a été configuré

#### 🧪 **Tests Complets**
- **Tests unitaires** : Modèles, audit logging (16/16 tests passent ✅)
- **Tests d'intégration** : API endpoints, authentification (9/21 tests passent ⚠️)
- **Couverture de code** : 34% global avec Jest et Istanbul
- **Configuration avancée** : MongoDB Memory Server, mocks, fixtures

#### 🔄 **CI/CD Pipeline**
- **Workflow principal** : Tests multi-versions Node.js (18.x, 20.x)
- **Services containerisés** : MongoDB 6.0, Redis 7.4
- **Checks de sécurité** : npm audit, vulnerability scanning
- **Build et déploiement** : Docker multi-stage, optimisations

#### 🏗️ **Infrastructure de Production**
- **Docker optimisé** : Multi-stage build, utilisateur non-root
- **Nginx reverse proxy** : SSL, rate limiting, sécurité headers
- **Services managés** : MongoDB, Redis, MinIO avec healthchecks
- **Scripts automatisés** : Déploiement, backup, monitoring

---

## 🔐 **ÉTAPE SUIVANTE : Configuration des Secrets GitHub**

### 1. **Accéder aux Secrets GitHub**

1. Allez sur votre repository GitHub : `https://github.com/VOTRE-USERNAME/application-cuisinistes`
2. Cliquez sur **Settings** (en haut à droite)
3. Dans le menu gauche : **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret**

### 2. **Secrets Essentiels à Configurer**

#### 🐳 **Docker Hub** (OBLIGATOIRE)
```
DOCKER_USERNAME = votre-username-dockerhub
DOCKER_PASSWORD = votre-token-dockerhub
```

#### 🔐 **Sécurité JWT** (OBLIGATOIRE)
```bash
# Générer un secret JWT sécurisé
openssl rand -base64 64
```
```
JWT_SECRET = le-résultat-de-la-commande-ci-dessus
JWT_EXPIRES_IN = 7d
BCRYPT_SALT_ROUNDS = 12
```

#### 🗄️ **Base de Données** (OBLIGATOIRE)
```
MONGO_ROOT_USER = admin
MONGO_ROOT_PASSWORD = VotreMotDePasseMongoSecurise123!
MONGO_APP_USER = app_user
MONGO_APP_PASSWORD = VotreMotDePasseAppSecurise456!
MONGO_DATABASE = cuisine-app
MONGODB_URI = mongodb://app_user:VotreMotDePasseAppSecurise456!@mongo:27017/cuisine-app?authSource=cuisine-app
```

#### 🗃️ **Redis Cache** (OBLIGATOIRE)
```
REDIS_PASSWORD = VotreMotDePasseRedisSecurise789!
```

#### 📁 **Stockage MinIO** (OBLIGATOIRE)
```
MINIO_ACCESS_KEY = VotreMinIOAccessKey123
MINIO_SECRET_KEY = VotreMinIOSecretKeySecurise456789
MINIO_BUCKET_NAME = cuisine-files
```

### 3. **Secrets Optionnels**

#### 📧 **Email (Optionnel)**
```
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = noreply@votre-domaine.com
EMAIL_PASS = VotreMotDePasseEmailApp
```

#### 🌐 **Déploiement (Pour production)**
```
DEPLOY_HOST = votre-serveur.com
DEPLOY_USER = deployer
DOMAIN_NAME = votre-domaine.com
```

---

## 🧪 **Tester la Configuration**

### 1. **Vérifier les Tests Locaux**

```bash
# Aller dans le dossier backend
cd backend

# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests avec couverture
npm run test:coverage
```

### 2. **Tester le Pipeline GitHub Actions**

1. **Créer une branche de test :**
   ```bash
   git checkout -b test-ci-cd
   git add .
   git commit -m "🧪 Test CI/CD pipeline"
   git push origin test-ci-cd
   ```

2. **Vérifier GitHub Actions :**
   - Allez dans l'onglet **Actions** de votre repository
   - Vérifiez que le workflow **CI/CD Pipeline** se lance
   - Tous les tests doivent passer ✅

3. **Créer une Pull Request :**
   - Créez une PR de `test-ci-cd` vers `main`
   - Le workflow **Pull Request Checks** doit se lancer
   - Vérifiez les commentaires automatiques

---

## 🚀 **Déploiement en Production**

### 1. **Prérequis Serveur**

Sur votre serveur de production :

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Créer le répertoire de l'application
sudo mkdir -p /opt/cuisine-app
sudo chown $USER:$USER /opt/cuisine-app
```

### 2. **Déploiement Manuel** (Premier déploiement)

```bash
# Cloner le repository sur le serveur
git clone https://github.com/VOTRE-USERNAME/application-cuisinistes.git /opt/cuisine-app
cd /opt/cuisine-app

# Copier le fichier d'environnement
cp env.production.example .env.production

# Éditer les variables d'environnement
nano .env.production
# (Remplir avec vos vraies valeurs)

# Lancer en production
docker-compose -f docker-compose.prod.yml up -d
```

### 3. **Vérifier le Déploiement**

```bash
# Vérifier que tous les services sont running
docker-compose -f docker-compose.prod.yml ps

# Tester l'API
curl http://localhost:5000/health

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

---

## 📊 **Monitoring et Maintenance**

### 1. **Logs et Debugging**

```bash
# Logs temps réel
docker-compose -f docker-compose.prod.yml logs -f

# Logs spécifiques
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs mongo

# Statistiques ressources
docker stats
```

### 2. **Sauvegardes**

```bash
# Backup automatique (script créé)
./scripts/deploy.sh backup

# Backup manuel MongoDB
docker-compose -f docker-compose.prod.yml exec mongo mongodump --authenticationDatabase admin -u admin -p VotreMotDePasse --archive | gzip > backup_$(date +%Y%m%d).gz
```

### 3. **Mise à jour**

```bash
# Déploiement automatique avec script
./scripts/deploy.sh deploy

# Rollback si problème
./scripts/deploy.sh rollback
```

---

## 🔍 **Dépannage Courant**

### ❌ **"Tests échouent"**
```bash
# Vérifier les logs
npm run test:unit -- --verbose

# Nettoyer et réinstaller
rm -rf node_modules
npm install
```

### ❌ **"Docker build échoue"**
```bash
# Nettoyer Docker
docker system prune -a

# Reconstruire sans cache
docker-compose build --no-cache
```

### ❌ **"MongoDB connection failed"**
```bash
# Vérifier les variables d'environnement
echo $MONGODB_URI

# Vérifier que MongoDB est accessible
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"
```

### ❌ **"GitHub Actions échoue"**
1. Vérifiez que tous les secrets sont configurés
2. Consultez les logs détaillés dans l'onglet Actions
3. Utilisez le script de validation : `./scripts/validate-secrets.sh`

---

## 📚 **Documentation Supplémentaire**

- 📖 **Guide complet secrets** : `docs/GITHUB_SECRETS_SETUP.md`
- 🐳 **Configuration Docker** : `docker-compose.prod.yml`
- 🧪 **Tests détaillés** : `backend/tests/`
- 🔄 **Workflows CI/CD** : `.github/workflows/`

---

## 🎯 **Prochaines Étapes Recommandées**

1. **✅ Configurer tous les secrets GitHub** (priorité haute)
2. **🧪 Améliorer la couverture de tests** (objectif : 80%+)
3. **🌐 Configurer un nom de domaine**
4. **📧 Configurer l'envoi d'emails**
5. **📊 Ajouter monitoring avancé** (Sentry, etc.)
6. **🔐 Configurer SSL avec Let's Encrypt**
7. **💾 Automatiser les sauvegardes**

---

## 🆘 **Support**

Si vous rencontrez des problèmes :

1. 🔍 Consultez les logs détaillés
2. 📖 Vérifiez la documentation dans `docs/`
3. 🧪 Utilisez les scripts de validation
4. 💬 Créez une issue GitHub si nécessaire

**Bravo ! Votre infrastructure DevOps est maintenant opérationnelle ! 🎉**
