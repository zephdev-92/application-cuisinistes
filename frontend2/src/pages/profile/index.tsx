import React, { useState, useEffect, useCallback } from 'react';
import type { NextPage } from 'next';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProfileForm, { ProfileFormData } from '@/components/forms/ProfileForm';
import PasswordForm, { PasswordFormData } from '@/components/forms/PasswordForm';
import Alert from '@/components/ui/Alert';

type PageWithLayout = NextPage<Record<string, unknown>> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

// Fonction utilitaire pour s'assurer que l'URL de l'image est bien formée
const formatImageUrl = (imagePath: string | undefined): string | undefined => {
  if (!imagePath) return undefined;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Si l'image commence déjà par http, la retourner telle quelle
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Sinon, construire l'URL complète
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const ProfilePage: PageWithLayout = () => {
  const { user } = useAuth();
  const { loading, error, updateProfile, updatePassword, fetchProfile, profileLoaded } = useProfile();
  const [success, setSuccess] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<Partial<ProfileFormData>>({});
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Fonction pour charger les données du profil
  const loadProfileData = useCallback(async () => {
    try {
      const data = await fetchProfile();
      if (data) {
        updateProfileDataFromResponse(data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err);
    }
  }, [fetchProfile, updateProfileDataFromResponse]);

  // Fonction pour mettre à jour les données du profil à partir de la réponse API
  const updateProfileDataFromResponse = useCallback((data: ProfileFormData) => {
    setProfileData({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      companyName: data.companyName || '',
      description: data.description || '',
      address: {
        street: data.address?.street || '',
        city: data.address?.city || '',
        postalCode: data.address?.postalCode || '',
        country: data.address?.country || 'France'
      },
      specialties: data.specialties || [],
      companyLogo: typeof data.companyLogo === 'string' ? formatImageUrl(data.companyLogo) : undefined
    });
  }, []);

  // Fonction pour mettre à jour les données du profil à partir de l'utilisateur en contexte
  const updateProfileDataFromUser = useCallback(() => {
    if (!user) return;

    setProfileData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      companyName: user.companyName || '',
      description: user.description || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        postalCode: user.address?.postalCode || '',
        country: user.address?.country || 'France'
      },
      specialties: user.specialties || [],
      companyLogo: typeof user.companyLogo === 'string' ? formatImageUrl(user.companyLogo) : undefined
    });
  }, [user]);

  // Charger les données du profil depuis l'API si nécessaire
  useEffect(() => {
    if (user && !profileLoaded) {
      loadProfileData();
    } else {
      updateProfileDataFromUser();
    }
  }, [user, profileLoaded, loadProfileData, updateProfileDataFromUser]);

  // Gestion de la soumission du formulaire de profil
  const handleProfileSubmit = async (formData: ProfileFormData) => {
    try {
      // Appel à updateProfile
      const updatedUser = await updateProfile(formData);
      setSuccess('Profil mis à jour avec succès');

      // Mise à jour locale des données du profil sans appel API supplémentaire
      if (updatedUser) {
        updateProfileDataFromResponse(updatedUser);
      } else {
        // Si updatedUser n'est pas disponible, faire un appel API pour obtenir les données à jour
        await loadProfileData();
      }

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      // L'erreur est déjà gérée par le hook useProfile
      console.error('Erreur lors de la mise à jour du profil:', err);
    }
  };

  // Gestion de la soumission du formulaire de mot de passe
  const handlePasswordSubmit = async (data: PasswordFormData) => {
    try {
      const result = await updatePassword(data);

      // Si on arrive ici, c'est que la mise à jour a réussi
      setSuccess('Mot de passe mis à jour avec succès');

      // Afficher le message de succès pendant 2 secondes puis déconnecter
      setTimeout(() => {
        // Rediriger vers la page de connexion
        window.location.href = '/login';
      }, 2000);

      return result;
    } catch (err) {
      // En cas d'erreur, on reste sur la page et on affiche l'erreur
      // L'erreur est déjà gérée par le hook useProfile qui met à jour l'état error
      console.error('Erreur lors de la mise à jour du mot de passe:', err);
      // On ne redirige pas
      return null;
    }
  };

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Mon Profil</h1>

        {/* Système d'onglets */}
        <div className="mt-6">
          <div className="sm:hidden">
            <select
              id="tabs"
              name="tabs"
              className="block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as 'profile' | 'password')}
            >
              <option value="profile">Informations personnelles</option>
              <option value="password">Mot de passe</option>
            </select>
          </div>

          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`${
                    activeTab === 'profile'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
                >
                  Informations personnelles
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`${
                    activeTab === 'password'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap`}
                >
                  Mot de passe
                </button>
              </nav>
            </div>
          </div>

          {/* Afficher les messages d'erreur et de succès au niveau de la page */}
          {error && <Alert type="error" title="Erreur" message={error} className="mt-4" />}
          {success && <Alert type="success" title="Succès" message={success} className="mt-4" />}

          {/* Contenu de l'onglet Profil */}
          {activeTab === 'profile' && (
            <div className="mt-6 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              {loading && !profileLoaded ? (
                <div className="text-center py-4">Chargement des informations...</div>
              ) : (
                <ProfileForm
                  initialData={profileData}
                  onSubmit={handleProfileSubmit}
                  loading={loading}
                  error={null} // Géré au niveau de la page
                  success={null} // Géré au niveau de la page
                />
              )}
            </div>
          )}

          {/* Contenu de l'onglet Mot de passe */}
          {activeTab === 'password' && (
            <div className="mt-6 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <PasswordForm
                onSubmit={handlePasswordSubmit}
                loading={loading}
                error={null} // Géré au niveau de la page
                success={null} // Géré au niveau de la page
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Définir le layout pour cette page
ProfilePage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default ProfilePage;
