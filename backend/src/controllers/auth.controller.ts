import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types/express';
import { auditLogger, AuditEventType } from '../utils/auditLogger';

// @desc    Inscrire un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { firstName, lastName, email, password, role, phone, vendeurSpecialty, specialties } = req.body;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  try {
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

    // Log d'audit de l'inscription réussie
    auditLogger.logAuth({
      eventType: AuditEventType.REGISTER,
      userId: result.user.id,
      email: result.user.email,
      ip,
      userAgent: req.headers['user-agent'],
      success: true
    });

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      ...result
    });
  } catch (error) {
    // Log d'audit de l'inscription échouée
    auditLogger.logAuth({
      eventType: AuditEventType.REGISTER,
      email,
      ip,
      userAgent: req.headers['user-agent'],
      success: false,
      failureReason: error instanceof Error ? error.message : 'Unknown error'
    });

    throw error;
  }
});

// @desc    Connecter un utilisateur
// @route   POST /api/auth/login
// @access  Public
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'];

  try {
    const result = await AuthService.login({ email, password });

    // Log d'audit de connexion réussie
    auditLogger.logAuth({
      eventType: AuditEventType.LOGIN_SUCCESS,
      userId: result.user.id,
      email: result.user.email,
      ip,
      userAgent,
      success: true
    });

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      ...result
    });
  } catch (error) {
    // Log d'audit de connexion échouée
    auditLogger.logAuth({
      eventType: AuditEventType.LOGIN_FAILURE,
      email,
      ip,
      userAgent,
      success: false,
      failureReason: error instanceof Error ? error.message : 'Unknown error'
    });

    throw error;
  }
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
export const logout = catchAsync(async (req: AuthRequest, res: Response): Promise<void> => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  // Log d'audit de déconnexion
  auditLogger.logAuth({
    eventType: AuditEventType.LOGOUT,
    userId: req.user!.id,
    ip,
    userAgent: req.headers['user-agent'],
    success: true
  });

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
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  if (!token) {
    throw new AppError('Token manquant', 401);
  }

  try {
    const newToken = await AuthService.refreshToken(token);

    // Log d'audit du renouvellement de token
    auditLogger.logAuth({
      eventType: AuditEventType.TOKEN_REFRESH,
      userId: req.user!.id,
      ip,
      userAgent: req.headers['user-agent'],
      success: true
    });

    res.status(200).json({
      success: true,
      token: newToken,
      message: 'Token rafraîchi avec succès'
    });
  } catch (error) {
    // Log d'audit d'échec de renouvellement
    auditLogger.logAuth({
      eventType: AuditEventType.TOKEN_REFRESH,
      userId: req.user?.id,
      ip,
      userAgent: req.headers['user-agent'],
      success: false,
      failureReason: error instanceof Error ? error.message : 'Unknown error'
    });

    throw error;
  }
});
