import axios, {
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import Router from 'next/router';

// Créer une instance Axios configurée
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Ajouter un intercepteur pour les requêtes
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // S'assurer que nous sommes côté client
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
);

// Ajouter un intercepteur pour les réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Vérifier si nous sommes déjà sur la page de connexion
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.setItem('redirectAfterLogin', Router.asPath);
        Router.push('/auth/login');
      }
    }
    return Promise.reject(error);
  }
);

// Fonction pour les requêtes authentifiées
export const authFetch = async <T>(
  url: string,
  options: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> => {
  try {
    // Vérifier si nous sommes côté client
    if (typeof window === 'undefined') {
      throw new Error('authFetch ne peut être utilisé que côté client');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Non authentifié');
    }

    const config: AxiosRequestConfig = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    };

    return await api<T>(url, config);
  } catch (error) {
    console.error('Erreur de requête authentifiée:', error);
    throw error;
  }
};

export default api;
