// backend/src/controllers/provider.controller.ts
import { Response } from 'express';
import User, { IUser } from '../models/User';
import { hash } from 'bcryptjs'; // Utiliser bcryptjs au lieu de bcrypt
import { AuthRequest } from '../types/express';
import { UserRole } from '../models/User';

// Obtenir tous les prestataires
export const getAllProviders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const providers = await User.find({ role: UserRole.PRESTATAIRE })
      .select('-password')
      .populate('showrooms', 'name address')
      .sort({ lastName: 1, firstName: 1 });

    res.status(200).json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des prestataires:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des prestataires',
      details: (error as Error).message
    });
  }
};

// Rechercher des prestataires par nom ou email
export const searchProviders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Paramètre de recherche requis'
      });
      return;
    }

    const searchQuery = {
      role: UserRole.PRESTATAIRE,
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    };

    const providers = await User.find(searchQuery)
      .select('-password')
      .populate('showrooms', 'name address')
      .sort({ lastName: 1, firstName: 1 });

    res.status(200).json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de prestataires:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la recherche de prestataires',
      details: (error as Error).message
    });
  }
};

// Obtenir un prestataire par ID
export const getProviderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const provider = await User.findOne({ _id: id, role: UserRole.PRESTATAIRE })
      .select('-password')
      .populate('showrooms', 'name address');

    if (!provider) {
      res.status(404).json({
        success: false,
        error: 'Prestataire non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: provider
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du prestataire:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du prestataire',
      details: (error as Error).message
    });
  }
};

// Créer un nouveau prestataire
export const createProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, phone, specialties, showrooms } = req.body;

    // Vérifier si l'email est déjà utilisé
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'Cet email est déjà utilisé'
      });
      return;
    }

    // Générer un mot de passe temporaire aléatoire
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hash(tempPassword, 10);

    // Créer le nouveau prestataire
    const newProvider = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: UserRole.PRESTATAIRE,
      specialties: specialties || [],
      showrooms: showrooms || [],
      profileCompleted: false, // Le profil n'est pas complet jusqu'à ce que l'utilisateur termine l'inscription
      active: true
    });

    // TODO: Envoyer un email au prestataire avec un lien pour compléter son inscription
    // Cette fonctionnalité sera développée ultérieurement
    console.log('Un email devrait être envoyé à', email, 'avec le mot de passe temporaire:', tempPassword);

    // Exclure le mot de passe de la réponse
    const providerResponse = newProvider.toObject() as Omit<IUser, 'password'> & { password?: string };
    delete providerResponse.password;

    res.status(201).json({
      success: true,
      data: providerResponse,
      message: 'Prestataire créé avec succès. Un email d\'invitation lui sera envoyé pour compléter son inscription.'
    });
  } catch (error) {
    console.error('Erreur lors de la création du prestataire:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du prestataire',
      details: (error as Error).message
    });
  }
};

// Mettre à jour un prestataire
export const updateProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, specialties, showrooms, active } = req.body;

    // Vérifier si le prestataire existe
    const provider = await User.findOne({ _id: id, role: UserRole.PRESTATAIRE });
    if (!provider) {
      res.status(404).json({
        success: false,
        error: 'Prestataire non trouvé'
      });
      return;
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== provider.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'Cet email est déjà utilisé'
        });
        return;
      }
    }

    // Mettre à jour le prestataire
    const updatedProvider = await User.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        email,
        phone,
        specialties,
        showrooms,
        active,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: updatedProvider
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du prestataire:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du prestataire',
      details: (error as Error).message
    });
  }
};

// Supprimer un prestataire (désactivation)
export const deleteProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Désactiver le prestataire au lieu de le supprimer
    const updatedProvider = await User.findOneAndUpdate(
      { _id: id, role: UserRole.PRESTATAIRE },
      { active: false, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedProvider) {
      res.status(404).json({
        success: false,
        error: 'Prestataire non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Prestataire désactivé avec succès',
      data: { id }
    });
  } catch (error) {
    console.error('Erreur lors de la désactivation du prestataire:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la désactivation du prestataire',
      details: (error as Error).message
    });
  }
};
