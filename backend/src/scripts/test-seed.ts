import mongoose from 'mongoose';
import config from '../config';
import User, { UserRole, VendeurSpecialty } from '../models/User';

// Script de test simple pour vérifier la connexion et les modèles
async function testConnection() {
  try {
    // Test de connexion
    console.log('🔗 Test de connexion à MongoDB...');
    await mongoose.connect(config.mongoURI);
    console.log('✅ Connexion réussie !');

    // Test des modèles
    console.log('📋 Test des modèles...');
    const userCount = await User.countDocuments();
    console.log(`   Utilisateurs existants: ${userCount}`);

    // Test des enums
    console.log('🏷️ Test des enums...');
    console.log(`   Rôles disponibles: ${Object.values(UserRole).join(', ')}`);
    console.log(`   Spécialités vendeur: ${Object.values(VendeurSpecialty).join(', ')}`);

    console.log('✅ Tous les tests sont OK !');
    console.log('\n🚀 Vous pouvez maintenant exécuter : npm run seed');

  } catch (error) {
    console.error('❌ Erreur de test:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion');
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testConnection()
    .then(() => {
      console.log('✅ Test terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec du test:', error);
      process.exit(1);
    });
}

export default testConnection;
