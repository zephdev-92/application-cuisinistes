import api from '../utils/api';
import axios from 'axios';

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
    const response = await api.post('/auth/login', { email, password });

    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response.data;
  },

  logout: async () => {
    try {
      // Appel optionnel au backend pour invalider le token
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
    }
  },

  getProfile: async () => {
    return api.get('/profile');
  },

  register: async (userData: RegisterData) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, userData);
    return response.data;
  },
};

export default authService;
