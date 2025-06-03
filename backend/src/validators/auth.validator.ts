import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { UserRole, VendeurSpecialty } from '../models/User';

// Schéma pour l'inscription
const registerSchema = Joi.object({
  firstName: Joi.string()
    .required()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.empty': 'Le prénom est requis',
      'string.min': 'Le prénom doit contenir au moins {#limit} caractères',
      'string.max': 'Le prénom ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le prénom est requis'
    }),

  lastName: Joi.string()
    .required()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.empty': 'Le nom est requis',
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne doit pas dépasser {#limit} caractères',
      'any.required': 'Le nom est requis'
    }),

  email: Joi.string()
    .required()
    .trim()
    .email()
    .messages({
      'string.empty': 'L\'email est requis',
      'string.email': 'Veuillez fournir un email valide',
      'any.required': 'L\'email est requis'
    }),

  password: Joi.string()
    .required()
    .min(6)
    .messages({
      'string.empty': 'Le mot de passe est requis',
      'string.min': 'Le mot de passe doit contenir au moins {#limit} caractères',
      'any.required': 'Le mot de passe est requis'
    }),

  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional()
    .messages({
      'any.only': 'Le rôle doit être vendeur, prestataire ou admin'
    }),

  vendeurSpecialty: Joi.when('role', {
    is: UserRole.VENDEUR,
    then: Joi.string()
      .valid(...Object.values(VendeurSpecialty))
      .required()
      .messages({
        'any.only': 'Veuillez choisir une spécialité de vendeur valide',
        'any.required': 'La spécialité est requise pour les vendeurs'
      }),
    otherwise: Joi.forbidden()
  }),

  phone: Joi.string()
    .optional()
    .trim()
    .pattern(/^\+?[\d\s-]{8,15}$/)
    .messages({
      'string.pattern.base': 'Veuillez fournir un numéro de téléphone valide'
    })
});

// Schéma pour la connexion
const loginSchema = Joi.object({
  email: Joi.string()
    .required()
    .trim()
    .email()
    .messages({
      'string.empty': 'L\'email est requis',
      'string.email': 'Veuillez fournir un email valide',
      'any.required': 'L\'email est requis'
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Le mot de passe est requis',
      'any.required': 'Le mot de passe est requis'
    })
});

// Middleware de validation pour l'inscription
export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = registerSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    // Formater les erreurs pour correspondre à la structure attendue
    const formattedErrors = error.details.map((err) => ({
      msg: err.message,
      param: err.path.join('.'),
      location: 'body'
    }));

    res.status(400).json({
      success: false,
      errors: formattedErrors
    });
    return;
  }

  // Mettre à jour les données validées et nettoyées
  req.body = value;
  next();
};

// Middleware de validation pour la connexion
export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    // Formater les erreurs pour correspondre à la structure attendue
    const formattedErrors = error.details.map((err) => ({
      msg: err.message,
      param: err.path.join('.'),
      location: 'body'
    }));

    res.status(400).json({
      success: false,
      errors: formattedErrors
    });
    return;
  }

  // Mettre à jour les données validées et nettoyées
  req.body = value;
  next();
};
