// src/types/user.ts

/**
 * Énumération des rôles d'utilisateur disponibles dans l'application
 */
export enum UserRole {
  CUISINISTE = 'cuisiniste',
  PRESTATAIRE = 'prestataire',
  ADMIN = 'admin',
}

/**
 * Interface représentant un utilisateur dans l'application
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  specialties?: string[];
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
  createdAt?: Date | string;
  updatedAt?: Date | string;
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
  confirmPassword?: string;
  role?: UserRole;
  phone?: string;
  terms?: boolean;
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
