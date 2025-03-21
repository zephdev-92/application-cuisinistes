import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Alert } from '@/components/ui/Alert';
import { UserRole, useAuth } from '@/contexts/auth.context';
import { useProfile } from '@/hooks/useProfile';
import Image from 'next/image';
import { NextPage } from 'next';
import { apiClient } from '@/lib/apiClient';

// Schéma de validation pour le formulaire de profil
const profileSchema = yup.object().shape({
  firstName: yup.string().required('Le prénom est requis'),
  lastName: yup.string().required('Le nom est requis'),
  email: yup.string().email('Email invalide').required("L'email est requis"),
  phone: yup.string().required('Le téléphone est requis'),
  companyName: yup.string().optional(),
  description: yup.string().optional(),
  street: yup.string().optional(),
  city: yup.string().optional(),
  postalCode: yup.string().optional(),
  country: yup.string().optional(),
  specialties: yup.array().of(yup.string().required()).optional(),
});

// Schéma de validation pour le formulaire de mot de passe
const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Le mot de passe actuel est requis'),
  newPassword: yup
    .string()
    .required('Le nouveau mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Les mots de passe ne correspondent pas')
    .required('Veuillez confirmer votre mot de passe'),
});

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  companyLogo?: File;
  description?: string;
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

type PageWithLayout = NextPage<Record<string, unknown>> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

const ProfilePage: PageWithLayout = () => {
  const { user } = useAuth();
  const { loading, error, updateProfile, updatePassword, fetchProfile, profileLoaded } =
    useProfile();
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [logoPreview, setLogoPreview] = useState<string | null>(user?.companyLogo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get('/profile');
        if (response.data.data.companyLogo) {
          // Définir le logo comme URL complète
          setLogoPreview(`http://localhost:5000${response.data.data.companyLogo}`);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // Configuration du formulaire de profil
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      companyName: user?.companyName || '',
      description: user?.description || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      postalCode: user?.address?.postalCode || '',
      country: user?.address?.country || 'France',
      specialties: user?.specialties || [],
    },
  });

  // Charger les données au montage du composant
  useEffect(() => {
    if (!profileLoaded) {
      const loadProfile = async () => {
        try {
          const profileData = await fetchProfile();

          // Mettre à jour les valeurs du formulaire
          if (profileData) {
            resetProfile({
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || '',
              email: profileData.email || '',
              phone: profileData.phone || '',
              companyName: profileData.companyName || '',
              description: profileData.description || '',
              street: profileData.address?.street || '',
              city: profileData.address?.city || '',
              postalCode: profileData.address?.postalCode || '',
              country: profileData.address?.country || 'France',
              specialties: profileData.specialties || [],
            });

            // Mettre à jour la prévisualisation du logo
            if (profileData.companyLogo) {
              setLogoPreview(`http://localhost:5000${profileData.companyLogo}`);
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
        }
      };

      loadProfile();
    }
  }, [fetchProfile, profileLoaded, resetProfile]);

  // Configuration du formulaire de mot de passe
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Soumission du formulaire de profil
  const onProfileSubmit = async (formData: ProfileFormData) => {
    try {
      const fileInput = fileInputRef.current;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.companyLogo = fileInput.files[0];
      }

      // Créer une copie des données pour éviter de modifier l'original
      const dataToSend = { ...formData };

      // Si c'est un cuisiniste, supprimer complètement le champ specialties
      if (user?.role === UserRole.CUISINISTE) {
        delete dataToSend.specialties;
      }
      // Sinon (pour les prestataires), s'assurer que c'est un tableau valide
      else if (dataToSend.specialties) {
        const selectedSpecialties =
          dataToSend.specialties.filter((s): s is string => s !== undefined) || [];
        dataToSend.specialties = selectedSpecialties;
      }

      // Envoyer les données nettoyées
      await updateProfile(dataToSend);
      setSuccess('Profil mis à jour avec succès');

      // Recharger les données du profil
      await fetchProfile();

      setTimeout(() => setSuccess(null), 3000);
    } catch {
      // L'erreur est déjà gérée par le hook useProfile
    }
  };

  // Soumission du formulaire de mot de passe
  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await updatePassword(data);
      setSuccess('Mot de passe mis à jour avec succès');
      resetPassword();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      // L'erreur est déjà gérée par le hook useProfile
    }
  };

  // Gestion du changement de logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Prévisualisation du logo
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  useEffect(() => {
    if (user?.companyLogo) {
      if (user.companyLogo.startsWith('http')) {
        setLogoPreview(user.companyLogo);
      } else if (user.companyLogo.startsWith('/')) {
        setLogoPreview(`http://localhost:5000${user.companyLogo}`);
      }
    }
  }, [user]);
  // Fonction pour ouvrir le sélecteur de fichier
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Mon Profil</h1>

        {error && <Alert type="error" title="Erreur" message={error} className="mt-4" />}

        {success && <Alert type="success" title="Succès" message={success} className="mt-4" />}

        <div className="mt-6">
          <div className="sm:hidden">
            <select
              id="tabs"
              name="tabs"
              className="block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
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

          {activeTab === 'profile' && (
            <div className="mt-6 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Informations personnelles
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Ces informations sont utilisées pour vous identifier sur la plateforme.
                    </p>
                  </div>

                  <div className="mt-5 md:col-span-2 md:mt-0">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Prénom
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          {...registerProfile('firstName')}
                          className={`mt-1 block w-full border ${
                            profileErrors.firstName ? 'border-red-300' : 'border-gray-300'
                          } rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm`}
                        />
                        {profileErrors.firstName && (
                          <p className="mt-2 text-sm text-red-600">
                            {profileErrors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Nom
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          {...registerProfile('lastName')}
                          className={`mt-1 block w-full border ${
                            profileErrors.lastName ? 'border-red-300' : 'border-gray-300'
                          } rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm`}
                        />
                        {profileErrors.lastName && (
                          <p className="mt-2 text-sm text-red-600">
                            {profileErrors.lastName.message}
                          </p>
                        )}
                      </div>

                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          {...registerProfile('email')}
                          className={`mt-1 block w-full border ${
                            profileErrors.email ? 'border-red-300' : 'border-gray-300'
                          } rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm`}
                        />
                        {profileErrors.email && (
                          <p className="mt-2 text-sm text-red-600">{profileErrors.email.message}</p>
                        )}
                      </div>

                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Téléphone
                        </label>
                        <input
                          type="text"
                          id="phone"
                          {...registerProfile('phone')}
                          className={`mt-1 block w-full border ${
                            profileErrors.phone ? 'border-red-300' : 'border-gray-300'
                          } rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm`}
                        />
                        {profileErrors.phone && (
                          <p className="mt-2 text-sm text-red-600">{profileErrors.phone.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Informations entreprise
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Ces informations seront affichées sur votre profil public.
                    </p>
                  </div>

                  <div className="mt-5 md:col-span-2 md:mt-0">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6">
                        <label
                          htmlFor="companyName"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Nom de l&apos;entreprise
                        </label>
                        <input
                          type="text"
                          id="companyName"
                          {...registerProfile('companyName')}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6">
                        <label className="block text-sm font-medium text-gray-700">
                          Logo de l&apos;entreprise
                        </label>
                        <div className="mt-1 flex items-center">
                          <div className="inline-block h-24 w-24 overflow-hidden rounded-md bg-gray-100">
                            {logoPreview && isValidUrl(logoPreview) ? (
                              <Image
                                src={logoPreview}
                                alt="Logo preview"
                                width={96}
                                height={96}
                                className="h-24 w-24 object-cover"
                                unoptimized={true}
                                crossOrigin="anonymous"
                              />
                            ) : (
                              <svg
                                className="h-full w-full text-gray-300"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            )}
                          </div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLogoChange}
                            className="hidden"
                            accept="image/*"
                          />
                          <button
                            type="button"
                            onClick={triggerFileInput}
                            className="ml-5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-4 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                          >
                            Changer
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">JPG, PNG, GIF jusqu&apos;à 5MB</p>
                      </div>

                      <div className="col-span-6">
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Description
                        </label>
                        <textarea
                          id="description"
                          rows={3}
                          {...registerProfile('description')}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                          Brève description de votre entreprise ou de vos services
                        </p>
                      </div>

                      {user?.role === UserRole.PRESTATAIRE && (
                        <div className="col-span-6">
                          <label
                            htmlFor="specialties"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Spécialités
                          </label>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {['pose', 'livraison', 'mesure', 'plomberie', 'électricité'].map(
                              (specialty) => (
                                <label key={specialty} className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    value={specialty}
                                    {...registerProfile('specialties')}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700 capitalize">
                                    {specialty}
                                  </span>
                                </label>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-10 md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Adresse</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Adresse de votre entreprise ou de votre domicile
                    </p>
                  </div>

                  <div className="mt-5 md:col-span-2 md:mt-0">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6">
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                          Rue
                        </label>
                        <input
                          type="text"
                          id="street"
                          {...registerProfile('street')}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                          Ville
                        </label>
                        <input
                          type="text"
                          id="city"
                          {...registerProfile('city')}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                        <label
                          htmlFor="postalCode"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Code postal
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          {...registerProfile('postalCode')}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                        <label
                          htmlFor="country"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Pays
                        </label>
                        <select
                          id="country"
                          {...registerProfile('country')}
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                        >
                          <option value="France">France</option>
                          <option value="Belgique">Belgique</option>
                          <option value="Suisse">Suisse</option>
                          <option value="Luxembourg">Luxembourg</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="mt-6 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Mot de passe</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Modifiez votre mot de passe. Nous vous recommandons d&apos;utiliser un mot de
                      passe fort et unique.
                    </p>
                  </div>

                  <div className="mt-5 md:col-span-2 md:mt-0">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-4">
                        <label
                          htmlFor="currentPassword"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Mot de passe actuel
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          {...registerPassword('currentPassword')}
                          className={`mt-1 block w-full border ${
                            passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                          } rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm`}
                        />
                        {passwordErrors.currentPassword && (
                          <p className="mt-2 text-sm text-red-600">
                            {passwordErrors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="col-span-6 sm:col-span-4">
                        <label
                          htmlFor="newPassword"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          {...registerPassword('newPassword')}
                          className={`mt-1 block w-full border ${
                            passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                          } rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm`}
                        />
                        {passwordErrors.newPassword && (
                          <p className="mt-2 text-sm text-red-600">
                            {passwordErrors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="col-span-6 sm:col-span-4">
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Confirmer le nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          {...registerPassword('confirmPassword')}
                          className={`mt-1 block w-full border ${
                            passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                          } rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm`}
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="mt-2 text-sm text-red-600">
                            {passwordErrors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                  >
                    {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Définir le layout pour cette page
ProfilePage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout title="Mon Profil">{page}</DashboardLayout>
);

export default ProfilePage;
