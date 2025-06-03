import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AuthRequest } from '../types/express';
import { VendeurSpecialty } from '../models/User';

// Schéma pour la mise à jour du profil
const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .optional()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Le prénom doit contenir au moins {#limit} caractères',
      'string.max': 'Le prénom ne doit pas dépasser {#limit} caractères'
    }),

  lastName: Joi.string()
    .optional()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne doit pas dépasser {#limit} caractères'
    }),

  email: Joi.string()
    .optional()
    .trim()
    .email()
    .messages({
      'string.email': 'Veuillez fournir un email valide'
    }),

  phone: Joi.string()
    .optional()
    .trim()
    .pattern(/^(\+?\d{1,4}[\s-])?(?!0+\s+,?$)\d{9,10}\s*,?$/)
    .messages({
      'string.pattern.base': 'Veuillez fournir un numéro de téléphone valide'
    }),

  companyName: Joi.string()
    .optional()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Le nom de l\'entreprise doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom de l\'entreprise ne doit pas dépasser {#limit} caractères'
    }),

  description: Joi.string()
    .optional()
    .trim()
    .allow(''),

  vendeurSpecialty: Joi.when('$userRole', {
    is: 'vendeur',
    then: Joi.string()
      .valid(...Object.values(VendeurSpecialty))
      .optional()
      .messages({
        'any.only': 'Veuillez choisir une spécialité de vendeur valide'
      }),
    otherwise: Joi.forbidden()
  }),

  specialties: Joi.when('$userRole', {
    is: 'vendeur',
    then: Joi.any().optional(),
    otherwise: Joi.array()
      .items(Joi.string().trim())
      .optional()
      .messages({
        'array.base': 'Les spécialités doivent être un tableau'
      })
  }),

  address: Joi.object({
    street: Joi.string().optional().trim().allow(''),
    city: Joi.string().optional().trim().allow(''),
    postalCode: Joi.string().optional().trim().allow(''),
    country: Joi.string().optional().trim().allow('')
  }).optional()
});

// Schéma pour la mise à jour du mot de passe
const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Le mot de passe actuel est requis',
      'any.required': 'Le mot de passe actuel est requis'
    }),

  newPassword: Joi.string()
    .required()
    .min(6)
    .messages({
      'string.empty': 'Le nouveau mot de passe est requis',
      'string.min': 'Le nouveau mot de passe doit contenir au moins {#limit} caractères',
      'any.required': 'Le nouveau mot de passe est requis'
    })
});

// Middleware de validation pour la mise à jour du profil
export const validateProfileUpdate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const { error, value } = updateProfileSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    context: { userRole: req.user?.role }
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

// Middleware de validation pour la mise à jour du mot de passe
export const validatePasswordUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = updatePasswordSchema.validate(req.body, {
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
