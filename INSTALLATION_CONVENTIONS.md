# 🚀 Installation Rapide - Conventions Git

## ⚡ Installation en une commande

```powershell
# Exécuter dans le dossier racine du projet
.\scripts\setup-git-hooks.ps1
```

## 🎯 Après installation

### **Nouveaux alias disponibles :**
```bash
git cb    # Créer une branche avec validation
git cm    # Commit assisté avec validation
```

### **Validation automatique :**
- ✅ **Commits** : Vérifiés automatiquement selon Conventional Commits
- ✅ **Branches** : Validées avant chaque push
- ✅ **PRs** : Validation complète dans GitHub Actions

## 🧪 Test de l'installation

### **1. Tester la création de branche :**
```bash
git cb
# Choisir "1" (feature)
# Entrer "test-conventions"
# → Doit créer feature/test-conventions
```

### **2. Tester le commit assisté :**
```bash
# Faire un petit changement
echo "test" > test.txt
git add test.txt

git cm
# Choisir "1" (feat)
# Scope: ""
# Description: "add test file"
# → Doit créer le commit "feat: add test file"
```

### **3. Tester la validation :**
```bash
# Essayer un commit invalide (doit échouer)
git commit -m "invalid commit message"
# → Doit afficher une erreur de validation
```

## 🛠️ Configuration manuelle (alternative)

Si le script automatique ne fonctionne pas :

### **1. Configurer le template de commit :**
```bash
git config commit.template .gitmessage
```

### **2. Configurer les alias :**
```bash
git config alias.cb "!powershell -ExecutionPolicy Bypass -File scripts/create-branch.ps1"
git config alias.cm "!powershell -ExecutionPolicy Bypass -File scripts/commit.ps1"
```

## 📋 Règles activées

### **Noms de branches :**
- ✅ `feature/description-courte`
- ✅ `fix/bug-description`
- ✅ `hotfix/urgent-fix`
- ✅ `refactor/code-cleanup`
- ✅ `docs/documentation-update`
- ✅ `test/add-tests`
- ✅ `chore/maintenance-task`

### **Messages de commit :**
- ✅ `feat(scope): description` (max 50 chars)
- ✅ `fix(api): resolve validation error`
- ✅ `docs: update installation guide`
- ✅ Minuscule, pas de point final
- ✅ Mode impératif (add, fix, update)

## 🚨 Que faire si ça bloque ?

### **Commit rejeté :**
```bash
# Utiliser l'assistant
git cm

# Ou corriger manuellement
git commit -m "feat(auth): add user authentication"
```

### **Push rejeté (nom de branche) :**
```bash
# Renommer la branche
git branch -m nouvelle-branche feature/nouvelle-branche

# Ou créer une nouvelle branche
git cb
```

### **Désactiver temporairement :**
```bash
# Désactiver les hooks temporairement
git commit --no-verify -m "emergency commit"
git push --no-verify
```

## ✅ Vérification de l'installation

Après installation, vous devriez voir :
- ✅ Fichiers créés : `.git/hooks/commit-msg.bat`, `.git/hooks/pre-push.bat`
- ✅ Alias configurés : `git cb`, `git cm`
- ✅ Template configuré : `.gitmessage`

## 🎉 Prêt !

Vos commits et branches seront maintenant automatiquement validés selon les meilleures pratiques !

Pour plus de détails, consultez `CONVENTIONS_GIT.md`.
