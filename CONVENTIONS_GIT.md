# 📏 Conventions Git - Commits et Branches

## 🎯 Vue d'ensemble

Ce document définit les règles strictes pour :
- ✅ Nommage des branches
- ✅ Messages de commit
- ✅ Validation automatique

---

## 🌿 Conventions de nommage des branches

### **Format obligatoire :**
```
type/description-courte
```

### **Types autorisés :**

| Type | Usage | Exemple |
|------|-------|---------|
| `feature/` | Nouvelle fonctionnalité | `feature/user-authentication` |
| `fix/` | Correction de bug | `fix/login-validation-error` |
| `hotfix/` | Correction urgente | `hotfix/security-vulnerability` |
| `refactor/` | Refactoring | `refactor/user-service-cleanup` |
| `docs/` | Documentation | `docs/api-documentation-update` |
| `test/` | Tests | `test/add-user-integration-tests` |
| `chore/` | Maintenance | `chore/update-dependencies` |

### **Règles de nommage :**

1. **Uniquement des minuscules**
2. **Séparer les mots par des tirets `-`**
3. **Maximum 50 caractères**
4. **Pas d'espaces ni caractères spéciaux**
5. **Descriptif et explicite**

### **❌ Exemples invalides :**
```bash
Feature/UserAuth          # Majuscules interdites
feature/user_auth         # Underscores interdits
feature/user auth         # Espaces interdits
feature/                  # Description manquante
fix/very-long-branch-name-that-exceeds-the-maximum-character-limit  # Trop long
```

### **✅ Exemples valides :**
```bash
feature/user-authentication
fix/password-reset-bug
hotfix/sql-injection-patch
refactor/api-response-format
docs/installation-guide
test/payment-integration
chore/eslint-configuration
```

---

## 💬 Conventions de commits (Conventional Commits)

### **Format obligatoire :**
```
type(scope): description

[body optionnel]

[footer optionnel]
```

### **Types de commits :**

| Type | Emoji | Description | Exemple |
|------|-------|-------------|---------|
| `feat` | ✨ | Nouvelle fonctionnalité | `feat(auth): add JWT authentication` |
| `fix` | 🐛 | Correction de bug | `fix(api): resolve validation error` |
| `docs` | 📝 | Documentation | `docs(readme): update installation steps` |
| `style` | 💄 | Formatage, style | `style(css): fix button alignment` |
| `refactor` | ♻️ | Refactoring | `refactor(user): simplify validation logic` |
| `test` | ✅ | Tests | `test(auth): add unit tests for login` |
| `chore` | 🔧 | Maintenance | `chore(deps): update dependencies` |
| `perf` | ⚡ | Performance | `perf(db): optimize user queries` |
| `ci` | 👷 | CI/CD | `ci(github): add workflow for testing` |
| `build` | 📦 | Build | `build(docker): update production image` |
| `revert` | ⏪ | Annulation | `revert: feat(auth): add JWT authentication` |

### **Règles des commits :**

1. **Description courte** (max 50 caractères)
2. **Minuscule** pour la description
3. **Pas de point** à la fin
4. **Mode impératif** ("add" pas "added")
5. **Scope optionnel** entre parenthèses
6. **Corps explicatif** si nécessaire

### **✅ Exemples valides :**
```bash
feat(auth): add user authentication system
fix(api): resolve email validation bug
docs(readme): update installation guide
test(user): add integration tests for signup
chore(deps): update npm dependencies
refactor(db): optimize database connection pool
```

### **❌ Exemples invalides :**
```bash
Add user authentication                    # Pas de type
feat(auth): Add user authentication.       # Majuscule + point
feat(auth): added user authentication      # Pas mode impératif
feature: user authentication               # Type incorrect
feat(auth): add a very long description that exceeds the fifty character limit  # Trop long
```

---

## 🛠️ Scripts d'aide

### **Script de création de branche :**

```bash
#!/bin/bash
# create-branch.sh

echo "🌿 Création d'une nouvelle branche"
echo ""
echo "Types disponibles:"
echo "1) feature  - Nouvelle fonctionnalité"
echo "2) fix      - Correction de bug"
echo "3) hotfix   - Correction urgente"
echo "4) refactor - Refactoring"
echo "5) docs     - Documentation"
echo "6) test     - Tests"
echo "7) chore    - Maintenance"
echo ""

read -p "Choisir le type (1-7): " type_choice
read -p "Description (ex: user-authentication): " description

case $type_choice in
    1) type="feature" ;;
    2) type="fix" ;;
    3) type="hotfix" ;;
    4) type="refactor" ;;
    5) type="docs" ;;
    6) type="test" ;;
    7) type="chore" ;;
    *) echo "❌ Type invalide"; exit 1 ;;
esac

branch_name="$type/$description"

# Validation
if [[ ! $branch_name =~ ^[a-z]+/[a-z0-9\-]+$ ]]; then
    echo "❌ Nom de branche invalide"
    echo "Utilisez uniquement des minuscules et des tirets"
    exit 1
fi

if [ ${#branch_name} -gt 50 ]; then
    echo "❌ Nom trop long (max 50 caractères)"
    exit 1
fi

# Créer et basculer sur la branche
git checkout -b "$branch_name"
echo "✅ Branche créée: $branch_name"
```

### **Script de commit assisté :**

```bash
#!/bin/bash
# commit.sh

echo "💬 Assistant de commit"
echo ""
echo "Types disponibles:"
echo "1) feat     - Nouvelle fonctionnalité"
echo "2) fix      - Correction de bug"
echo "3) docs     - Documentation"
echo "4) style    - Style/formatage"
echo "5) refactor - Refactoring"
echo "6) test     - Tests"
echo "7) chore    - Maintenance"
echo ""

read -p "Choisir le type (1-7): " type_choice
read -p "Scope (optionnel, ex: auth): " scope
read -p "Description courte: " description

case $type_choice in
    1) type="feat" ;;
    2) type="fix" ;;
    3) type="docs" ;;
    4) type="style" ;;
    5) type="refactor" ;;
    6) type="test" ;;
    7) type="chore" ;;
    *) echo "❌ Type invalide"; exit 1 ;;
esac

# Construire le message
if [ -n "$scope" ]; then
    commit_msg="$type($scope): $description"
else
    commit_msg="$type: $description"
fi

# Validation
if [ ${#commit_msg} -gt 50 ]; then
    echo "❌ Message trop long (max 50 caractères)"
    echo "Message: $commit_msg (${#commit_msg} caractères)"
    exit 1
fi

echo ""
echo "Message de commit: $commit_msg"
read -p "Confirmer ? (y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    git commit -m "$commit_msg"
    echo "✅ Commit créé avec succès"
else
    echo "❌ Commit annulé"
fi
```

---

## 📋 Checklist de validation

### **Avant chaque commit :**
- [ ] Le nom de branche respecte le format `type/description`
- [ ] Le message de commit suit le format `type(scope): description`
- [ ] La description est en minuscule et sans point final
- [ ] Le message fait moins de 50 caractères
- [ ] Le type de commit est approprié
- [ ] Le code a été testé localement

### **Avant chaque push :**
- [ ] Tous les tests passent
- [ ] Le linting est OK
- [ ] Pas de fichiers sensibles dans le commit
- [ ] La branche cible est correcte

---

## 🎯 Résumé des règles

### **Branches :**
- Format: `type/description-courte`
- Types: `feature`, `fix`, `hotfix`, `refactor`, `docs`, `test`, `chore`
- Minuscules + tirets uniquement
- Max 50 caractères

### **Commits :**
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`
- Description en minuscule, sans point final
- Max 50 caractères
- Mode impératif

Ces conventions garantissent un historique Git propre, des releases automatisées et une meilleure collaboration ! 🎉
