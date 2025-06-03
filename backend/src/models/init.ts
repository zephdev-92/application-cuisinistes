// models/init.ts
/**
 * Ce fichier garantit que tous les modèles sont correctement importés et enregistrés
 * Il doit être importé AVANT toute connexion à la base de données
 */

// Importer explicitement tous les modèles ici
import './User';
import './Showroom'
import './Client';
// Ajouter les autres modèles selon votre structure...

import mongoose from 'mongoose';

// Fonction de diagnostic pour vérifier que les modèles sont correctement enregistrés
export const verifyModels = () => {
  const registeredModels = mongoose.modelNames();
  console.log('=== MODEL VERIFICATION ===');
  console.log('Currently registered models:', registeredModels);

  // Liste des modèles attendus
  const expectedModels = ['User', 'Showroom', 'Client']; // Ajouter vos autres modèles

  // Vérifier que tous les modèles attendus sont enregistrés
  const missingModels = expectedModels.filter(model => !registeredModels.includes(model));

  if (missingModels.length > 0) {
    console.error('CRITICAL ERROR: The following models are not registered:', missingModels);
    return false;
  }

  console.log('All models are correctly registered');
  console.log('=========================');
  return true;
};

// Exécuter la vérification au chargement du module
verifyModels();

export default {
  verifyModels
};
