import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { apiClient } from '@/lib/apiClient';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  success: boolean;
  error?: string;
  errors?: Array<{ msg: string }>;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  companyLogo?: File | string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  // Champs d'adresse à plat pour la compatibilité avec le backend
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  specialties?: string[];
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const useProfile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const profileDataCache = useRef<ProfileFormData | null>(null);

  // Utilisation d'un memo avec useCallback pour éviter les appels inutiles
  const fetchProfile = useCallback(async () => {
    try {
      // Si nous avons déjà chargé les données et qu'elles sont en cache, retourner le cache
      if (profileLoaded && profileDataCache.current) {
        return profileDataCache.current;
      }

      setLoading(true);
      const response = await apiClient.get('/profile');

      // Structurer les données avec l'adresse imbriquée pour l'utilisation dans le frontend
      const data = response.data.data;
      const formattedData = {
        ...data,
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          postalCode: data.address?.postalCode || '',
          country: data.address?.country || 'France'
        }
      };

      // Mettre en cache les données pour éviter des appels répétés
      profileDataCache.current = formattedData;

      if (setUser) {
        setUser(data); // Conserver la structure originale pour le contexte utilisateur
      }

      setProfileLoaded(true);
      setLoading(false);
      return formattedData;
    } catch (error) {
      setLoading(false);
      console.error('Error fetching profile:', error);
      throw error;
    }
  }, [profileLoaded, setUser]);

  // Mettre à jour le profil
  const updateProfile = useCallback(async (data: ProfileFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Créer un FormData pour envoyer le fichier
      const formData = new FormData();

      // Ajouter les champs au FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'companyLogo' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'specialties' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'address' && value && typeof value === 'object') {
          // Traiter les champs d'adresse séparément et les aplatir
          Object.entries(value).forEach(([addressKey, addressValue]) => {
            if (addressValue !== undefined && addressValue !== null) {
              formData.append(addressKey, String(addressValue));
            }
          });
        } else if (key !== 'address' && value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await apiClient.put('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Mettre à jour le cache avec la structure imbriquée pour l'adresse
      const updatedData = response.data.data;
      const formattedData = {
        ...updatedData,
        address: {
          street: updatedData.address?.street || '',
          city: updatedData.address?.city || '',
          postalCode: updatedData.address?.postalCode || '',
          country: updatedData.address?.country || 'France'
        }
      };

      profileDataCache.current = formattedData;

      // Mettre à jour l'utilisateur dans le contexte
      if (setUser) {
        setUser(updatedData); // Conserver la structure originale pour le contexte utilisateur
      }

      setLoading(false);
      return formattedData;
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.errors?.[0]?.msg ||
        'Une erreur est survenue lors de la mise à jour du profil';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, [setUser]);

  // Mettre à jour le mot de passe
// Mettre à jour le mot de passe
const updatePassword = useCallback(async (data: PasswordFormData) => {
  setLoading(true);
  setError(null);

  try {
    const { currentPassword, newPassword } = data;
    const response = await apiClient.put('/profile/password', { currentPassword, newPassword });

    setLoading(false);

    // Déconnecter l'utilisateur uniquement en cas de succès
    try {
      // Appel API pour déconnecter l'utilisateur côté serveur
      await apiClient.post('/auth/logout');

      // Effacer les données locales
      if (setUser) {
        setUser(null);
      }

      // Suppression du token d'authentification
      localStorage.removeItem('token');
    } catch (logoutError) {
      console.error('Erreur lors de la déconnexion:', logoutError);
      // Continuer même en cas d'erreur de déconnexion
    }

    return response.data;
  } catch (err: unknown) {
    const error = err as AxiosError<ApiErrorResponse>;
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.errors?.[0]?.msg ||
      'Une erreur est survenue lors de la mise à jour du mot de passe';
    setError(errorMessage);
    setLoading(false);
    throw new Error(errorMessage); // On relance l'erreur pour que le composant sache qu'il y a eu une erreur
  }
}, [setUser]);

  return {
    user,
    loading,
    error,
    updateProfile,
    updatePassword,
    fetchProfile,
    profileLoaded,
  };
};
