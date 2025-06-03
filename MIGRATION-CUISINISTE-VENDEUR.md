# Migration : Cuisiniste → Vendeur avec Spécialités

## 📋 Résumé des changements

Cette migration transforme le système de rôles de l'application :
- **Avant** : Rôle `CUISINISTE`
- **Après** : Rôle `VENDEUR` avec champ `vendeurSpecialty`

## 🎯 Objectif

Permettre aux vendeurs de spécifier leur domaine d'expertise :
- **Cuisiniste** (anciens cuisinistes)
- **Mobilier**
- **Électroménager**
- (autres métiers à ajouter facilement)

## 🔄 Modifications effectuées

### Backend

#### 1. Modèle User (`backend/src/models/User.ts`)
```typescript
// Nouveau enum pour les rôles
export enum UserRole {
  VENDEUR = 'vendeur',        // ← était CUISINISTE
  PRESTATAIRE = 'prestataire',
  ADMIN = 'admin'
}

// Nouvel enum pour les spécialités vendeur
export enum VendeurSpecialty {
  CUISINISTE = 'cuisiniste',
  MOBILIER = 'mobilier',
  ELECTROMENAGER = 'electromenager'
}

// Nouveau champ dans l'interface
export interface IUser {
  // ... autres champs
  vendeurSpecialty?: VendeurSpecialty; // Requis si role = VENDEUR
}
```

#### 2. Validators
- **`auth.validator.ts`** : Validation du rôle VENDEUR + vendeurSpecialty
- **`profile.validator.ts`** : Gestion des spécialités selon le rôle
- **`client.validator.ts`** : Conversion vers Joi (cohérence)

#### 3. Controllers & Routes
- **`provider.controller.ts`** : Remplacé CUISINISTE → VENDEUR
- **`provider.routes.ts`** : Autorisations mises à jour

### Frontend

#### 1. Types (`frontend2/src/types/user.ts`)
```typescript
export enum UserRole {
  VENDEUR = 'vendeur',
  PRESTATAIRE = 'prestataire',
  ADMIN = 'admin'
}

export enum VendeurSpecialty {
  CUISINISTE = 'cuisiniste',
  MOBILIER = 'mobilier',
  ELECTROMENAGER = 'electromenager'
}
```

#### 2. Pages & Composants
- **Registration** : Sélection du rôle + spécialité conditionnelle
- **Dashboard** : Cartes adaptées au rôle VENDEUR
- **Sidebar** : Navigation mise à jour

## 🚀 Migration des données

### Script automatique
```bash
# Dans le dossier backend
npm run migrate:cuisiniste-to-vendeur
```

Ce script :
1. Trouve tous les utilisateurs avec `role: 'cuisiniste'`
2. Les met à jour vers `role: 'vendeur'` + `vendeurSpecialty: 'cuisiniste'`
3. Affiche un rapport détaillé

### Migration manuelle (si nécessaire)
```javascript
// Dans MongoDB
db.users.updateMany(
  { role: 'cuisiniste' },
  {
    $set: {
      role: 'vendeur',
      vendeurSpecialty: 'cuisiniste'
    }
  }
)
```

## 🎨 Interface utilisateur

### Inscription
1. L'utilisateur choisit son rôle : "Vendeur" ou "Prestataire"
2. Si "Vendeur" → Menu déroulant des spécialités apparaît
3. Validation : spécialité obligatoire pour les vendeurs

### Dashboard
- **Vendeurs** : Accès à Clients, Projets, Prestataires
- **Prestataires** : Accès à Prestations, Disponibilités
- **Admins** : Accès complet

## ✅ Tests de validation

### Backend
```bash
cd backend
npm run build  # Vérifier compilation TypeScript
npm run dev    # Tester l'API
```

### Frontend
```bash
cd frontend2
npm run build  # Vérifier compilation Next.js
npm run dev    # Tester l'interface
```

### Tests manuels
1. **Inscription vendeur** : Vérifier champ spécialité obligatoire
2. **Connexion** : Vérifier dashboard adapté au rôle
3. **API** : Tester endpoints avec nouveau rôle VENDEUR

## 🔮 Extensions futures

### Nouvelles spécialités
```typescript
export enum VendeurSpecialty {
  CUISINISTE = 'cuisiniste',
  MOBILIER = 'mobilier',
  ELECTROMENAGER = 'electromenager',
  // Ajouter facilement :
  DECORATION = 'decoration',
  BRICOLAGE = 'bricolage',
  JARDIN = 'jardin'
}
```

### Permissions granulaires
```typescript
// Exemple : permissions par spécialité
const PERMISSIONS = {
  [VendeurSpecialty.CUISINISTE]: ['cuisine', 'electromenager'],
  [VendeurSpecialty.MOBILIER]: ['mobilier', 'decoration'],
  // ...
}
```

## ⚠️ Points d'attention

1. **Rétrocompatibilité** : L'ancien rôle 'cuisiniste' n'existera plus
2. **Migration obligatoire** : Exécuter le script avant mise en production
3. **Frontend** : Mettre à jour tous les composants utilisant CUISINISTE
4. **Documentation** : Informer les utilisateurs du changement

---

*Migration effectuée le : [Date]*
*Version : 2.0.0*
