// Script d'initialisation MongoDB pour la production

// Connexion en tant qu'admin
db = db.getSiblingDB('admin');

// Vérifier les variables d'environnement
const dbName = process.env.MONGO_DATABASE || 'cuisine-app';
const appUser = process.env.MONGO_APP_USER || 'app_user';
const appPassword = process.env.MONGO_APP_PASSWORD || 'app_password';

print('🔄 Initialisation de la base de données MongoDB...');
print(`📊 Base de données: ${dbName}`);
print(`👤 Utilisateur applicatif: ${appUser}`);

// Passer à la base de données de l'application
db = db.getSiblingDB(dbName);

// Créer l'utilisateur de l'application s'il n'existe pas
try {
  db.createUser({
    user: appUser,
    pwd: appPassword,
    roles: [
      {
        role: 'readWrite',
        db: dbName
      },
      {
        role: 'dbAdmin',
        db: dbName
      }
    ]
  });
  print(`✅ Utilisateur ${appUser} créé avec succès`);
} catch (error) {
  if (error.code === 51003) {
    print(`ℹ️  L'utilisateur ${appUser} existe déjà`);
  } else {
    print(`❌ Erreur lors de la création de l'utilisateur: ${error.message}`);
    throw error;
  }
}

// Créer les index essentiels
print('🔍 Création des index...');

// Index pour les utilisateurs
try {
  db.users.createIndex({ email: 1 }, { unique: true });
  db.users.createIndex({ role: 1 });
  db.users.createIndex({ active: 1 });
  db.users.createIndex({ createdAt: -1 });
  print('✅ Index utilisateurs créés');
} catch (error) {
  print(`⚠️  Erreur index utilisateurs: ${error.message}`);
}

// Index pour les clients
try {
  db.clients.createIndex({ email: 1 });
  db.clients.createIndex({ createdBy: 1 });
  db.clients.createIndex({ createdAt: -1 });
  db.clients.createIndex({
    firstName: 'text',
    lastName: 'text',
    email: 'text'
  }, {
    name: 'client_search_index'
  });
  print('✅ Index clients créés');
} catch (error) {
  print(`⚠️  Erreur index clients: ${error.message}`);
}

// Index pour les showrooms
try {
  db.showrooms.createIndex({ name: 1 });
  db.showrooms.createIndex({ 'address.city': 1 });
  db.showrooms.createIndex({ managers: 1 });
  db.showrooms.createIndex({ providers: 1 });
  print('✅ Index showrooms créés');
} catch (error) {
  print(`⚠️  Erreur index showrooms: ${error.message}`);
}

// Index pour les sessions/tokens (si utilisé)
try {
  db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  db.sessions.createIndex({ userId: 1 });
  print('✅ Index sessions créés');
} catch (error) {
  print(`⚠️  Erreur index sessions: ${error.message}`);
}

print('🎉 Initialisation MongoDB terminée avec succès!');
