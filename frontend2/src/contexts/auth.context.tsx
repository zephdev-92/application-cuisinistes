import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { apiClient } from '../lib/apiClient';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  error?: string;
  errors?: Array<{ msg: string }>;
}

// Types d'utilisateur
export enum UserRole {
  CUISINISTE = 'cuisiniste',
  PRESTATAIRE = 'prestataire',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  companyName?: string; // Ajout
  companyLogo?: string; // Ajout
  description?: string; // Ajout
  address?: {
    // Ajout
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  specialties?: string[]; // Ajout
  profileCompleted: boolean;
}

// Types pour l'inscription et la connexion
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  confirmPassword?: string;
  terms?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

// Interface du context d'authentification
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

// Création du context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  register: async () => {},
  login: async () => {},
  logout: async () => {},
  clearError: () => {},
  setUser: () => {},
});

// Props du provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider du context d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const router = useRouter();

  // Vérifier si l'utilisateur est déjà connecté (au chargement initial)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await apiClient.get('/auth/me');
        setUser(response.data.data);
        setIsAuthenticated(true);
      } catch {
        Cookies.remove('token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Fonction d'inscription
  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Données d'inscription:", data);
      const response = await apiClient.post('/auth/register', data);
      console.log("Réponse d'inscription:", response.data);
      // Sauvegarder le token dans un cookie
      Cookies.set('token', response.data.token, { expires: 7 });

      // Mettre à jour l'état du contexte
      setUser(response.data.user);
      setIsAuthenticated(true);

      // Rediriger vers le tableau de bord
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error("Erreur d'inscription:", error);
      //console.log("Réponse d'erreur:", error.response?.data);
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.errors?.[0]?.msg ||
        "Une erreur est survenue lors de l'inscription";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de connexion
  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/auth/login', data);

      // Sauvegarder le token dans un cookie
      Cookies.set('token', response.data.token, { expires: 7 });

      // Mettre à jour l'état du contexte
      setUser(response.data.user);
      setIsAuthenticated(true);

      // Rediriger vers le tableau de bord
      router.push('/dashboard');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.errors?.[0]?.msg ||
        'Identifiants invalides';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      setLoading(true);

      // Appeler l'API de déconnexion (bien que ce soit principalement côté client)
      await apiClient.post('/auth/logout');

      // Supprimer le token du cookie
      Cookies.remove('token');

      // Réinitialiser l'état
      setUser(null);
      setIsAuthenticated(false);

      // Rediriger vers la page d'accueil
      router.push('/');
    } catch {
      // Même en cas d'erreur, on déconnecte l'utilisateur localement
      Cookies.remove('token');
      setUser(null);
      setIsAuthenticated(false);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour effacer les erreurs
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        register,
        login,
        logout,
        clearError,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le context d'authentification
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
};
