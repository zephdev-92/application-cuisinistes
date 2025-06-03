import jwt from 'jsonwebtoken';
import config from '../config';
import { UserService, CreateUserDTO } from './UserService';
import { AppError } from '../middleware/errorHandler';
import { IUser } from '../models/User';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResult {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone?: string;
    profileCompleted: boolean;
    vendeurSpecialty?: string;
  };
  token: string;
}

export class AuthService {
  /**
   * Générer un JWT token
   */
  private static generateToken(userId: string): string {
    return jwt.sign({ id: userId }, config.jwtSecret as string, {
      expiresIn: config.jwtExpire
    });
  }

  /**
   * Formater les données utilisateur pour la réponse
   */
  private static formatUserResponse(user: IUser): AuthResult['user'] {
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileCompleted: user.profileCompleted,
      vendeurSpecialty: user.vendeurSpecialty
    };
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  static async register(userData: CreateUserDTO): Promise<AuthResult> {
    try {
      // Créer l'utilisateur via UserService
      const user = await UserService.createUser(userData);

      // Générer le token
      const token = this.generateToken(user._id.toString());

      return {
        user: this.formatUserResponse(user),
        token
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erreur lors de l\'inscription', 500);
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { email, password } = credentials;

    // Validation des entrées
    if (!email || !password) {
      throw new AppError('Veuillez fournir un email et un mot de passe', 400);
    }

    // Trouver l'utilisateur avec le mot de passe
    const user = await UserService.getUserByEmail(email, true);

    if (!user) {
      throw new AppError('Identifiants invalides', 401);
    }

    // Vérifier si l'utilisateur est actif
    if (!user.active) {
      throw new AppError('Ce compte a été désactivé', 401);
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Identifiants invalides', 401);
    }

    // Générer le token
    const token = this.generateToken(user._id.toString());

    return {
      user: this.formatUserResponse(user),
      token
    };
  }

  /**
   * Vérifier et décoder un JWT token
   */
  static async verifyToken(token: string): Promise<{ id: string }> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret as string) as { id: string };
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expiré. Veuillez vous reconnecter.', 401);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Token invalide. Veuillez vous reconnecter.', 401);
      }
      throw new AppError('Erreur d\'authentification', 401);
    }
  }

  /**
   * Obtenir l'utilisateur depuis un token
   */
  static async getUserFromToken(token: string): Promise<IUser> {
    const decoded = await this.verifyToken(token);
    const user = await UserService.getUserById(decoded.id);

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    if (!user.active) {
      throw new AppError('Compte désactivé', 401);
    }

    return user;
  }

  /**
   * Rafraîchir un token (optionnel pour une future implémentation)
   */
  static async refreshToken(oldToken: string): Promise<string> {
    const decoded = await this.verifyToken(oldToken);
    const user = await UserService.getUserById(decoded.id);

    if (!user || !user.active) {
      throw new AppError('Impossible de rafraîchir le token', 401);
    }

    return this.generateToken(user._id.toString());
  }

  /**
   * Réinitialisation de mot de passe (pour future implémentation)
   */
  static async requestPasswordReset(email: string): Promise<void> {
    const user = await UserService.getUserByEmail(email);

    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe
      return;
    }

    // TODO: Générer un token de réinitialisation
    // TODO: Envoyer un email

    throw new AppError('Fonctionnalité non encore implémentée', 501);
  }

  /**
   * Changer le mot de passe (pour future implémentation)
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await UserService.getUserByEmail('', true); // TODO: Adapter cette méthode

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Mot de passe actuel incorrect', 400);
    }

    // TODO: Mettre à jour le mot de passe
    // user.password = newPassword;
    // await user.save();

    throw new AppError('Fonctionnalité non encore implémentée', 501);
  }
}
