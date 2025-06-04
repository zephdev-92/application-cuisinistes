# 🚀 Workflow de Développement

## 📋 Vue d'ensemble

Ce projet utilise un workflow de développement avec deux branches principales :

- **`dev`** : Branche de développement et de test
- **`main`** : Branche de production stable

## 🔄 Flux de travail

### 1. Développement sur `dev`

```bash
# Basculer sur dev
git checkout dev

# Faire vos modifications
git add .
git commit -m "feat: nouvelle fonctionnalité"

# Pousser vers dev
git push origin dev
```

**Ce qui se passe automatiquement :**
- ✅ Tous les tests s'exécutent
- ✅ Vérification de sécurité (npm audit)
- ✅ Build Docker pour validation
- ✅ Linting et vérifications TypeScript

### 2. Promotion vers production (`main`)

Quand tout fonctionne sur `dev`, créez une Pull Request :

```bash
# Depuis GitHub ou en ligne de commande
gh pr create --base main --head dev --title "Release: Deploy to production"
```

**Ce qui se passe automatiquement :**
- 🔍 **Validation PR** : Tests complets et validations
- 🛡️ **Sécurité** : Audit approfondi
- 🏗️ **Build** : Vérification Docker
- ✅ **Résumé** : Rapport détaillé dans la PR

### 3. Déploiement production

Après merge de la PR vers `main` :

```bash
git checkout main
git pull origin main
```

**Ce qui se passe automatiquement :**
- 🚀 **Déploiement** : Job deploy s'exécute
- 📦 **Image Docker** : Construite pour production
- 🔔 **Notifications** : Confirmation de déploiement

## 🛡️ Protection des branches

### Configuration recommandée sur GitHub :

1. **Allez dans** : Settings → Branches
2. **Protégez `main`** avec ces règles :
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

### Status checks requis :
- `pr-tests` (Tests de la PR)
- `validate-pr` (Validation structure)

## 📊 Statut des branches

| Branche | Usage | Tests | Déploiement |
|---------|-------|--------|-------------|
| `dev` | Développement | ✅ Complets | ❌ Aucun |
| `main` | Production | ✅ Via PR | ✅ Automatique |

## 🔧 Commandes utiles

### Créer une nouvelle fonctionnalité :
```bash
git checkout dev
git pull origin dev
# ... développement ...
git push origin dev
```

### Synchroniser dev avec main :
```bash
git checkout dev
git pull origin main
git push origin dev
```

### Vérification locale avant push :
```bash
cd backend
npm run lint
npm run test
npm run build
```

## 🚨 Règles importantes

1. **Ne jamais pousser directement sur `main`**
2. **Toujours passer par `dev` d'abord**
3. **Attendre que tous les tests passent sur `dev`**
4. **Une seule PR dev → main à la fois**
5. **Merger rapidement après validation**

## 🐛 En cas de problème

### Si les tests échouent sur `dev` :
```bash
# Fixer les problèmes localement
npm run test
npm run lint

# Pousser les corrections
git add .
git commit -m "fix: correction tests"
git push origin dev
```

### Si la PR vers `main` échoue :
1. Retourner sur `dev`
2. Fixer les problèmes
3. Pousser sur `dev`
4. La PR se mettra à jour automatiquement

## 📈 Avantages de ce workflow

- ✅ **Sécurité** : `main` toujours stable
- ✅ **Tests** : Validation complète avant production
- ✅ **Collaboration** : Revue de code obligatoire
- ✅ **Traçabilité** : Historique clair des déploiements
- ✅ **Rollback** : Facile de revenir en arrière

## 🔗 Liens utiles

- [Configuration Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub Actions Workflows](https://docs.github.com/en/actions/using-workflows)
- [Pull Request Best Practices](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/getting-started/best-practices-for-pull-requests)
