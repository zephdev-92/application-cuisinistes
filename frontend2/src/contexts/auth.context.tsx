import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../services/authService';
import { AxiosError } from 'axios';
import { User, RegisterData, UserRole } from '../types/user';
import Cookies from 'js-cookie';

interface ApiErrorResponse {
  success: boolean;
  error?: string;
  errors?: Array<{ msg: string }>;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

// Créer le contexte avec une valeur par défaut
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Props pour le provider
interface AuthProviderProps {
  children: ReactNode;
}

// Créer le provider du contexte
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier si nous sommes dans un environnement navigateur
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem('token') || Cookies.get('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Récupérer les infos de l'utilisateur
        const response = await authService.getProfile();
        setUser(response.data.data);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        localStorage.removeItem('token');
        Cookies.remove('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const clearError = () => setError(null);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);

      // Stocker le token à la fois dans localStorage et dans un cookie
      localStorage.setItem('token', response.token);
      Cookies.set('token', response.token, {
        expires: 7, // 7 jours
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Redirection après connexion
      const redirectPath =
        router.query.redirect?.toString() ||
        localStorage.getItem('redirectAfterLogin') ||
        '/dashboard';

      localStorage.removeItem('redirectAfterLogin');
      router.push(redirectPath);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.error || 'Une erreur est survenue lors de la connexion');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);

      // Supprimer le token du localStorage et des cookies
      localStorage.removeItem('token');
      Cookies.remove('token');

      router.push('/auth/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      setUser(response.user);

      // Stocker le token à la fois dans localStorage et dans un cookie
      localStorage.setItem('token', response.token);
      Cookies.set('token', response.token, {
        expires: 7, // 7 jours
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      router.push('/dashboard');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.error || "Une erreur est survenue lors de l'inscription");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    loading: isLoading,
    error,
    login,
    logout,
    register,
    setUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export { UserRole };
