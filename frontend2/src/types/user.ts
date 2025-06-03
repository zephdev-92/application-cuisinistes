// src/types/user.ts

/**
 * Énumération des rôles d'utilisateur disponibles dans l'application
 */
export enum UserRole {
  ADMIN = 'admin',
  PRESTATAIRE = 'prestataire',
  VENDEUR = 'vendeur'
}

/**
 * Enum pour les sous-métiers des vendeurs
 */
export enum VendeurSpecialty {
  CUISINISTE = 'cuisiniste',
  MOBILIER = 'mobilier',
  ELECTROMENAGER = 'electromenager'
}

/**
 * Interface représentant un utilisateur dans l'application
 */
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  specialties?: string[];
  vendeurSpecialty?: VendeurSpecialty;
  showrooms?: string[];
  companyName?: string;
  companyLogo?: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  profileCompleted: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface pour les données de connexion utilisateur
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface pour les données d'inscription utilisateur
 */
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  vendeurSpecialty?: VendeurSpecialty;
  phone?: string;
}

/**
 * Interface pour la mise à jour du profil utilisateur
 */
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  description?: string;
  specialties?: string[];
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Interface pour la mise à jour du mot de passe
 */
export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Interface pour la réponse d'authentification
 */
export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}
