// frontend/src/lib/axios.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Créer une instance axios configurée
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes
});

// Type pour la config avec workaround pour la compatibilité avec axios v0.x et v1.x
type ConfigType = AxiosRequestConfig & { headers?: Record<string, string> };

// Intercepteur pour les requêtes
axiosInstance.interceptors.request.use(
  (config: ConfigType): ConfigType => {
    // Récupérer le token depuis le localStorage
    let token: string | null = null;

    // Vérifier si window est défini (pour éviter les erreurs côté serveur avec Next.js)
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }

    // Si le token existe, l'ajouter aux headers
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Token ajouté à la requête:', `Bearer ${token.substring(0, 15)}...`);
    }

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error("Erreur dans l'intercepteur de requête:", error);
    return Promise.reject(error);
  }
);

// Type personnalisé pour la gestion des erreurs
interface ApiError extends Error {
  isAxiosError?: boolean;
  response?: {
    status: number;
    data: unknown;
  };
  config?: ConfigType;
}

// Intercepteur pour les réponses
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: ApiError): Promise<never> => {
    // Gérer les erreurs 401 (non autorisé)
    if (error.response && error.response.status === 401) {
      console.log('Erreur 401 détectée - Authentification requise');

      // Si nous sommes sur le client (navigateur)
      if (typeof window !== 'undefined') {
        // Supprimer le token invalide
        localStorage.removeItem('token');

        // Rediriger vers la page de connexion
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
