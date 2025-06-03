// Script de migration pour convertir les cuisinistes en vendeurs
import mongoose from 'mongoose';
import User, { UserRole, VendeurSpecialty } from '../models/User';
import config from '../config';

const migrateUsers = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(config.mongoURI);
    console.log('✅ Connecté à MongoDB');

    // Rechercher tous les utilisateurs avec le rôle "cuisiniste"
    const cuisinistes = await User.find({ role: 'cuisiniste' });

    if (cuisinistes.length === 0) {
      console.log('ℹ️  Aucun cuisiniste trouvé à migrer');
      return;
    }

    console.log(`🔄 Migration de ${cuisinistes.length} cuisiniste(s) vers vendeur...`);

    // Mettre à jour chaque cuisiniste
    const updateResults = await Promise.all(
      cuisinistes.map(async (user) => {
        try {
          const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
              role: UserRole.VENDEUR,
              vendeurSpecialty: VendeurSpecialty.CUISINISTE // Par défaut, cuisiniste devient spécialité cuisiniste
            },
            { new: true }
          );

          console.log(`✅ Migré: ${updatedUser?.firstName} ${updatedUser?.lastName} (${updatedUser?.email})`);
          return { success: true, user: updatedUser, originalUser: user };
        } catch (error) {
          console.error(`❌ Erreur migration ${user.firstName} ${user.lastName}:`, error);
          return { success: false, user: null, originalUser: user, error };
        }
      })
    );

    const successCount = updateResults.filter(result => result.success).length;
    const errorCount = updateResults.filter(result => !result.success).length;

    console.log(`\n📊 Résultats de la migration:`);
    console.log(`   ✅ Réussis: ${successCount}`);
    console.log(`   ❌ Échecs: ${errorCount}`);

    if (errorCount > 0) {
      console.log('\n❌ Utilisateurs non migrés:');
      updateResults
        .filter(result => !result.success)
        .forEach(result => {
          const user = result.originalUser;
          console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`);
        });
    }

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
};

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateUsers()
    .then(() => {
      console.log('🎉 Migration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export default migrateUsers;
