import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { UserRole, IUser } from '../models/User';
import config from '../config';
import { AuthRequest } from '../types/express';

// Type pour la requête d'inscription
interface RegisterRequest extends Request {
  body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
  };
}

// Type pour la requête de connexion
interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

// Générer un JWT token
const generateToken = (id: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwtExpire
  };
  return jwt.sign({ id }, config.jwtSecret as jwt.Secret, options);
};

// @desc    Inscrire un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: RegisterRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role, phone } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'Un utilisateur avec cet email existe déjà'
      });
      return;
    }

    // Créer un nouvel utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || UserRole.PRESTATAIRE,
      phone
    });

    // Générer un token
    const token = generateToken(user._id.toString());

    // Envoyer la réponse
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Connecter un utilisateur
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: LoginRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Valider l'email et le mot de passe
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Veuillez fournir un email et un mot de passe'
      });
      return;
    }

    // Trouver l'utilisateur et inclure le mot de passe pour la comparaison
    const user = await User.findOne({ email }).select('+password');

    // Vérifier si l'utilisateur existe
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      });
      return;
    }

    // Vérifier si l'utilisateur est actif
    if (!user.active) {
      res.status(401).json({
        success: false,
        error: 'Ce compte a été désactivé'
      });
      return;
    }

    // Vérifier si le mot de passe correspond
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      });
      return;
    }

    // Générer un token
    const token = generateToken(user._id.toString());

    // Envoyer la réponse
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileCompleted: user.profileCompleted
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les informations de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // L'utilisateur est déjà disponible via le middleware d'authentification
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        specialties: user.specialties,
        showrooms: user.showrooms,
        profileCompleted: user.profileCompleted
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Déconnexion de l'utilisateur (invalider le token côté client)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {}
  });
};
