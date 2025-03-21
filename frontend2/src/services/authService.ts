import { apiClient } from '../lib/apiClient';
import Cookies from 'js-cookie';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
}

export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });

    if (response.data && response.data.token) {
      // Stocker le token dans localStorage pour la persistance
      localStorage.setItem('token', response.data.token);

      // Stocker le token dans un cookie pour les requêtes SSR et middleware
      Cookies.set('token', response.data.token, {
        expires: 7, // 7 jours
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }

    return response.data;
  },

  logout: async () => {
    try {
      // Appel optionnel au backend pour invalider le token
      const token = Cookies.get('token') || localStorage.getItem('token');
      if (token) {
        await apiClient.post('/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Supprimer le token des deux stockages
      localStorage.removeItem('token');
      Cookies.remove('token');
    }
  },

  getProfile: async () => {
    return apiClient.get('/profile');
  },

  register: async (userData: RegisterData) => {
    const response = await apiClient.post('/auth/register', userData);

    if (response.data && response.data.token) {
      // Stocker le token dans localStorage pour la persistance
      localStorage.setItem('token', response.data.token);

      // Stocker le token dans un cookie pour les requêtes SSR et middleware
      Cookies.set('token', response.data.token, {
        expires: 7, // 7 jours
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }

    return response.data;
  },

  forgotPassword: async (email: string) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string) => {
    return apiClient.post('/auth/reset-password', { token, password });
  }
};

export default authService;
