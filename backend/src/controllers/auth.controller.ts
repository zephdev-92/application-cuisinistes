import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types/express';

// @desc    Inscrire un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { firstName, lastName, email, password, role, phone, vendeurSpecialty, specialties } = req.body;

  const result = await AuthService.register({
    firstName,
    lastName,
    email,
    password,
    role,
    phone,
    vendeurSpecialty,
    specialties
  });

  res.status(201).json({
    success: true,
    message: 'Inscription réussie',
    ...result
  });
});

// @desc    Connecter un utilisateur
// @route   POST /api/auth/login
// @access  Public
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  const result = await AuthService.login({ email, password });

  res.status(200).json({
    success: true,
    message: 'Connexion réussie',
    ...result
  });
});

// @desc    Obtenir les informations de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
export const getMe = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const user = await UserService.getUserById(req.user!.id);

  res.status(200).json({
    success: true,
    data: {
      id: user!._id,
      firstName: user!.firstName,
      lastName: user!.lastName,
      email: user!.email,
      role: user!.role,
      phone: user!.phone,
      specialties: user!.specialties,
      vendeurSpecialty: user!.vendeurSpecialty,
      showrooms: user!.showrooms,
      profileCompleted: user!.profileCompleted,
      companyName: user!.companyName,
      description: user!.description,
      address: user!.address
    }
  });
});

// @desc    Déconnexion de l'utilisateur
// @route   POST /api/auth/logout
// @access  Private
export const logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// @desc    Rafraîchir le token
// @route   POST /api/auth/refresh
// @access  Private
export const refreshToken = catchAsync(async (req: AuthRequest, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('Token manquant', 401);
  }

  const newToken = await AuthService.refreshToken(token);

  res.status(200).json({
    success: true,
    token: newToken,
    message: 'Token rafraîchi avec succès'
  });
});
