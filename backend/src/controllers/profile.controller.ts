// backend/src/controllers/profile.controller.ts
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types/express';
import fs from 'fs';
import path from 'path';

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour le profil de l'utilisateur
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
      return;
    }

    const {
      firstName, lastName, email, phone, companyName, description,
      street, city, postalCode, country, specialties
    } = req.body;

    const updateData: any = {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      description,
      address: {
        street,
        city,
        postalCode,
        country: country || 'France'
      }
    };

    // Si des spécialités sont fournies et que l'utilisateur est un prestataire
if (req.body.specialties && req.user?.role === 'prestataire') {
    let specialties = req.body.specialties;

    // Traitement pour s'assurer que c'est un tableau
    if (typeof specialties === 'string') {
      try {
        specialties = JSON.parse(specialties);
      } catch (e) {
        specialties = [specialties];
      }
    }

    if (!Array.isArray(specialties)) {
      specialties = specialties ? [specialties] : [];
    }

    updateData.specialties = specialties;
  }

    // Si un logo a été uploadé via multer
    if ((req as any).file) {
        // Générer l'URL pour le logo
       
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        updateData.companyLogo = `${backendUrl}/uploads/${(req as any).file.filename}`;
      // Supprimer l'ancien logo si existant
      const user = await User.findById(req.user.id);
      if (user?.companyLogo) {
        const oldLogoPath = path.join(__dirname, '../../', user.companyLogo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
      return;
    }

    // Marquer le profil comme complété si toutes les informations nécessaires sont présentes
    if (!updatedUser.profileCompleted) {
      const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
      const allFieldsPresent = requiredFields.every(field => !!updatedUser[field as keyof typeof updatedUser]);

      if (allFieldsPresent) {
        updatedUser.profileCompleted = true;
        await updatedUser.save();
      }
    }

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour le mot de passe
// @route   PUT /api/profile/password
// @access  Private
export const updatePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
      return;
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
      return;
    }

    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Mot de passe actuel incorrect'
      });
      return;
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};
