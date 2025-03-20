import axios from 'axios';
import Cookies from 'js-cookie';

// Configuration de l'instance axios
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Rediriger vers la page de connexion si le token est expiré ou invalide
    if (error.response?.status === 401) {
      // Vérifier si nous sommes dans le navigateur
      if (typeof window !== 'undefined') {
        // Supprimer le token expiré
        Cookies.remove('token');

        // Rediriger vers la page de connexion si l'erreur n'est pas déjà venue d'une tentative de connexion
        const isAuthRoute = window.location.pathname.includes('/auth/login') ||
                            window.location.pathname.includes('/auth/register');

        if (!isAuthRoute) {
          window.location.href = '/auth/login?session=expired';
        }
      }
    }

    return Promise.reject(error);
  }
);
