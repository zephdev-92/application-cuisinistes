import User, { IUser, UserRole, VendeurSpecialty } from '../models/User';
import Showroom from '../models/Showroom';
import { AppError } from '../middleware/errorHandler';
import { Types } from 'mongoose';

// DTOs (Data Transfer Objects)
export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  vendeurSpecialty?: VendeurSpecialty;
  specialties?: string[];
}

export interface UpdateUserProfileDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  specialties?: string[];
}

export class UserService {
  /**
   * Créer un nouvel utilisateur
   */
  static async createUser(userData: CreateUserDTO): Promise<IUser> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Un utilisateur avec cet email existe déjà', 400);
    }

    // Validation métier pour les vendeurs
    if (userData.role === UserRole.VENDEUR && !userData.vendeurSpecialty) {
      throw new AppError('La spécialité est requise pour les vendeurs', 400);
    }

    // Validation métier pour les prestataires
    if (userData.role === UserRole.PRESTATAIRE && userData.vendeurSpecialty) {
      throw new AppError('Les prestataires ne peuvent pas avoir de spécialité vendeur', 400);
    }

    // Créer l'utilisateur
    const user = await User.create(userData);
    return user;
  }

  /**
   * Obtenir un utilisateur par son email
   */
  static async getUserByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = User.findOne({ email, active: true });
    if (includePassword) {
      query.select('+password');
    }
    return query.populate('showrooms');
  }

  /**
   * Obtenir un utilisateur par son ID
   */
  static async getUserById(id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID utilisateur invalide', 400);
    }

    return User.findById(id).populate('showrooms');
  }

  /**
   * Mettre à jour le profil d'un utilisateur
   */
  static async updateUserProfile(userId: string, updateData: UpdateUserProfileDTO): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).populate('showrooms');

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    return user;
  }

  /**
   * Marquer le profil comme complété
   */
  static async markProfileCompleted(userId: string): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { profileCompleted: true },
      { new: true }
    );

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    return user;
  }

  /**
   * Assigner un utilisateur à un showroom
   */
  static async assignToShowroom(userId: string, showroomId: string): Promise<void> {
    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Vérifier que le showroom existe
    const showroom = await Showroom.findById(showroomId);
    if (!showroom) {
      throw new AppError('Showroom non trouvé', 404);
    }

    // Ajouter le showroom à l'utilisateur si pas déjà présent
    if (!user.showrooms?.some(id => id.toString() === showroomId)) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { showrooms: showroomId }
      });
    }

    // Ajouter l'utilisateur au showroom selon son rôle
    if (user.role === UserRole.VENDEUR) {
      await Showroom.findByIdAndUpdate(showroomId, {
        $addToSet: { managers: userId }
      });
    } else if (user.role === UserRole.PRESTATAIRE) {
      await Showroom.findByIdAndUpdate(showroomId, {
        $addToSet: { providers: userId }
      });
    }
  }

  /**
   * Retirer un utilisateur d'un showroom
   */
  static async removeFromShowroom(userId: string, showroomId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Retirer le showroom de l'utilisateur
    await User.findByIdAndUpdate(userId, {
      $pull: { showrooms: showroomId }
    });

    // Retirer l'utilisateur du showroom
    await Showroom.findByIdAndUpdate(showroomId, {
      $pull: {
        managers: userId,
        providers: userId
      }
    });
  }

  /**
   * Obtenir tous les prestataires
   */
  static async getPrestataires(filters?: {
    specialties?: string[];
    showroomId?: string;
    active?: boolean;
  }) {
    const query: any = {
      role: UserRole.PRESTATAIRE,
      active: filters?.active !== false
    };

    if (filters?.specialties && filters.specialties.length > 0) {
      query.specialties = { $in: filters.specialties };
    }

    if (filters?.showroomId) {
      query.showrooms = filters.showroomId;
    }

    return User.find(query)
      .select('-password')
      .populate('showrooms', 'name address')
      .sort({ firstName: 1, lastName: 1 });
  }

  /**
   * Obtenir tous les vendeurs
   */
  static async getVendeurs(filters?: {
    vendeurSpecialty?: VendeurSpecialty;
    showroomId?: string;
    active?: boolean;
  }) {
    const query: any = {
      role: UserRole.VENDEUR,
      active: filters?.active !== false
    };

    if (filters?.vendeurSpecialty) {
      query.vendeurSpecialty = filters.vendeurSpecialty;
    }

    if (filters?.showroomId) {
      query.showrooms = filters.showroomId;
    }

    return User.find(query)
      .select('-password')
      .populate('showrooms', 'name address')
      .sort({ firstName: 1, lastName: 1 });
  }

  /**
   * Désactiver un utilisateur (soft delete)
   */
  static async deactivateUser(userId: string): Promise<void> {
    const user = await User.findByIdAndUpdate(userId, { active: false });
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }
  }

  /**
   * Réactiver un utilisateur
   */
  static async activateUser(userId: string): Promise<void> {
    const user = await User.findByIdAndUpdate(userId, { active: true });
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }
  }

  /**
   * Rechercher des utilisateurs
   */
  static async searchUsers(searchTerm: string, role?: UserRole) {
    const query: any = {
      active: true,
      $or: [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { companyName: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    if (role) {
      query.role = role;
    }

    return User.find(query)
      .select('-password')
      .populate('showrooms', 'name address')
      .limit(20)
      .sort({ firstName: 1, lastName: 1 });
  }
}
