# 🌱 Seeding de la base de données

## 📋 Vue d'ensemble

Le script de seeding permet de remplir la base de données MongoDB avec des données de test réalistes pour le développement et les tests.

## 🎯 Données créées

### Utilisateurs
- **1 Admin** : `admin@example.com` / `password`
- **5 Vendeurs** : `vendeur@example.com` / `password` + 4 vendeurs générés
- **8 Prestataires** : `prestataire@example.com` / `password` + 7 prestataires générés

### Showrooms
- **3 Showrooms** répartis à Paris, Lyon et Marseille
- Chaque showroom est associé à des vendeurs et prestataires

### Clients
- **50 Clients** (10 par vendeur)
- Données générées avec Faker.js

## 🚀 Utilisation

### Pré-requis
```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres MongoDB
```

### Exécuter le seeding
```bash
# Seeding complet (efface et recrée toutes les données)
npm run seed

# Alternative : exécution directe
npx ts-node src/scripts/seed.ts
```

## ⚙️ Configuration

Modifiez les constantes dans `src/scripts/seed.ts` :

```typescript
const SEED_CONFIG = {
  ADMINS: 1,           // Nombre d'admins
  VENDEURS: 5,         // Nombre de vendeurs
  PRESTATAIRES: 8,     // Nombre de prestataires
  SHOWROOMS: 3,        // Nombre de showrooms
  CLIENTS_PER_VENDEUR: 10, // Clients par vendeur
};
```

## 🏗️ Structure des données

### Vendeurs
- Répartis sur les 3 spécialités : Cuisiniste, Mobilier, Électroménager
- Associés à des showrooms
- Profils complets avec entreprise et adresse

### Prestataires
- Spécialités variées : Installation, Plomberie, Électricité, etc.
- Associés à des showrooms
- Quelques profils non complétés (réaliste)

### Showrooms
- Adresses réelles à Paris, Lyon, Marseille
- Managers (vendeurs) et providers (prestataires) assignés
- Informations de contact complètes

## 🔑 Comptes de test

Après le seeding, vous pouvez vous connecter avec :

| Rôle | Email | Mot de passe | Description |
|------|-------|--------------|-------------|
| Admin | `admin@example.com` | `password` | Accès complet |
| Vendeur | `vendeur@example.com` | `password` | Vendeur cuisiniste |
| Prestataire | `prestataire@example.com` | `password` | Prestataire installation |

## 🧹 Nettoyage

Le script efface automatiquement toutes les données existantes avant de créer les nouvelles données.

**⚠️ Attention** : Le seeding supprime toutes les données existantes !

## 📊 Résultat attendu

```
🌱 Début du seeding...
🧹 Base de données nettoyée
✅ 1 admin(s) créé(s)
✅ 3 showroom(s) créé(s)
✅ 5 vendeur(s) créé(s)
✅ 8 prestataire(s) créé(s)
✅ 50 client(s) créé(s)

🎉 Seeding terminé avec succès !

📊 Résumé:
   👨‍💼 Admins: 1
   🏢 Showrooms: 3
   🛍️ Vendeurs: 5
   🔧 Prestataires: 8
   👥 Clients: 50

🔑 Comptes de test:
   Admin: admin@example.com / password
   Vendeur: vendeur@example.com / password
   Prestataire: prestataire@example.com / password
```

## 🔧 Dépannage

### Erreur de connexion MongoDB
```bash
❌ Erreur lors du seeding: MongoNetworkError
```
- Vérifiez que MongoDB est démarré
- Vérifiez la variable `MONGODB_URI` dans `.env`

### Erreur de dépendances
```bash
❌ Cannot find module '@faker-js/faker'
```
- Exécutez `npm install` pour installer les dépendances

### Erreur de modèles
```bash
❌ Cannot find module '../models/User'
```
- Vérifiez que tous les modèles sont correctement importés
- Compilez TypeScript avec `npm run build`

## 🔄 Extension

Pour ajouter de nouveaux types de données :

1. Créez les modèles MongoDB correspondants
2. Ajoutez une méthode `createXXX()` dans la classe `DatabaseSeeder`
3. Appelez la méthode dans `run()`
4. Mettez à jour la configuration `SEED_CONFIG`

## 📝 Logs

Le script affiche des logs détaillés pour chaque étape :
- ✅ Succès
- ❌ Erreurs
- 🔌 Connexions/Déconnexions
- 📊 Statistiques finales
