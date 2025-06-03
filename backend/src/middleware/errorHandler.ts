import { Request, Response, NextFunction } from 'express';
import { auditLogger, AuditEventType } from '../utils/auditLogger';

// Interface pour les erreurs personnalisées
export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: number; // Ajout pour les erreurs MongoDB
  type?: string; // Ajout pour les erreurs de parsing
}

// Classe pour créer des erreurs personnalisées
export class AppError extends Error implements CustomError {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Gestion des erreurs de validation MongoDB
const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Gestion des erreurs de duplication MongoDB
const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || 'unknown';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// Gestion des erreurs de validation MongoDB
const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Gestion des erreurs JWT
const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired! Please log in again.', 401);

// Gestion des erreurs de parsing JSON
const handleJsonParseError = (err: any): AppError => {
  const message = 'Invalid JSON format';
  return new AppError(message, 400);
};

// Envoyer les erreurs en développement
const sendErrorDev = (err: CustomError, res: Response) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Envoyer les erreurs en production
const sendErrorProd = (err: CustomError, res: Response) => {
  // Erreurs opérationnelles, de confiance : envoyer le message au client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
  } else {
    // Erreurs de programmation : ne pas divulguer les détails
    console.error('ERROR 💥', err);

    res.status(500).json({
      success: false,
      message: 'Something went wrong!'
    });
  }
};

// Middleware principal de gestion d'erreurs
export const globalErrorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = (req as any).startTime || Date.now();
  const duration = Date.now() - startTime;

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log d'audit pour les erreurs API
  const userId = (req as any).user?.id;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  auditLogger.logApiError({
    userId,
    ip,
    method: req.method,
    url: req.originalUrl,
    statusCode: err.statusCode,
    error: err.message,
    duration
  });

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Gestion spécifique des erreurs MongoDB
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.name === 'JsonParseError') error = handleJsonParseError(error);
    if (error.type === 'entity.parse.failed') error = handleJsonParseError(error);

    sendErrorProd(error, res);
  }
};

// Middleware pour capturer les erreurs asynchrones
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// Middleware pour capturer le temps de début de requête
export const requestTimer = (req: Request, res: Response, next: NextFunction) => {
  (req as any).startTime = Date.now();
  next();
};

// Middleware pour les routes non trouvées
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
};
