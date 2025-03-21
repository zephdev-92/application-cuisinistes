import { useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { apiClient } from '@/lib/apiClient';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  success: boolean;
  error?: string;
  errors?: Array<{ msg: string }>;
}

interface ProfileFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  description?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  specialties?: string[];
  companyLogo?: File | null;
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

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/profile');
      if (setUser) {
        setUser(response.data.data);
      }
      setProfileLoaded(true);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  };

  // Mettre à jour le profil
  const updateProfile = async (data: ProfileFormData) => {
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
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await apiClient.put('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Mettre à jour l'utilisateur dans le contexte
      if (setUser) {
        setUser(response.data.data);
      }

      return response.data.data;
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.errors?.[0]?.msg ||
        'Une erreur est survenue lors de la mise à jour du profil';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le mot de passe
  const updatePassword = async (data: PasswordFormData) => {
    setLoading(true);
    setError(null);

    try {
      const { currentPassword, newPassword } = data;
      const response = await apiClient.put('/profile/password', { currentPassword, newPassword });

      return response.data;
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.errors?.[0]?.msg ||
        'Une erreur est survenue lors de la mise à jour du mot de passe';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
