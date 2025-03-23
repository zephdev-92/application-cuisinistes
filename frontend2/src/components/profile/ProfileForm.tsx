import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Alert } from '@/components/ui/Alert';
import { UserRole, useAuth } from '@/contexts/auth.context';
import Image from 'next/image';

// Schéma de validation pour le formulaire de profil
const profileSchema = yup.object().shape({
  firstName: yup.string().required('Le prénom est requis'),
  lastName: yup.string().required('Le nom est requis'),
  email: yup.string().email('Email invalide').required("L'email est requis"),
  phone: yup.string().required('Le téléphone est requis'),
  companyName: yup.string().optional(),
  description: yup.string().optional(),
  address: yup.object().shape({
    street: yup.string().optional(),
    city: yup.string().optional(),
    postalCode: yup.string().optional(),
    country: yup.string().optional()
  }).optional(),
  specialties: yup.array().of(yup.string().required()).optional(),
});

export interface ProfileFormData {
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
  specialties?: string[];
}

interface ProfileFormProps {
  initialData: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: string | null;
}

// Fonction utilitaire pour vérifier si l'URL est valide
const isValidImageUrl = (url: string | null): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (error: unknown) {
    console.error('Erreur lors de la validation de l\'URL de l\'image:', error);
    return false;
  }
};

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  loading,
  error,
  success,
}) => {
  const { user } = useAuth();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevInitialDataRef = useRef<Partial<ProfileFormData>>({});

  // Configuration du formulaire de profil
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: initialData.firstName || '',
      lastName: initialData.lastName || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      companyName: initialData.companyName || '',
      description: initialData.description || '',
      address: {
        street: initialData.address?.street || '',
        city: initialData.address?.city || '',
        postalCode: initialData.address?.postalCode || '',
        country: initialData.address?.country || 'France'
      },
      specialties: initialData.specialties || [],
    },
  });

  // Mettre à jour les valeurs du formulaire et le logo preview quand les données initiales changent
  useEffect(() => {
    // Vérifier si les données ont réellement changé pour éviter les mises à jour inutiles
    const hasChanged = Object.keys(initialData).some(
      key => initialData[key as keyof ProfileFormData] !==
             prevInitialDataRef.current[key as keyof ProfileFormData]
    );

    if (hasChanged) {
      // Mettre à jour la référence aux données précédentes
      prevInitialDataRef.current = { ...initialData };

      // Mettre à jour le logoPreview si nécessaire
      if (initialData.companyLogo && typeof initialData.companyLogo === 'string') {
        setLogoPreview(initialData.companyLogo);
      }

      // Réinitialiser le formulaire
      reset({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        companyName: initialData.companyName || '',
        description: initialData.description || '',
        address: {
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          postalCode: initialData.address?.postalCode || '',
          country: initialData.address?.country || 'France'
        },
        specialties: initialData.specialties || [],
      });
    }
  }, [initialData, reset]);

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

  // Fonction pour ouvrir le sélecteur de fichier
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Soumission du formulaire
  const handleFormSubmit = async (formData: ProfileFormData) => {
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

    // Créer un nouvel objet avec la structure d'adresse aplatie
    const flattenedData = {
      ...dataToSend,
      street: dataToSend.address?.street,
      city: dataToSend.address?.city,
      postalCode: dataToSend.address?.postalCode,
      country: dataToSend.address?.country
    };
    delete flattenedData.address;

    // Envoyer les données nettoyées
    await onSubmit(flattenedData);
  };

  return (
    <div>
      {/* Afficher les alertes seulement si elles sont définies et ne sont pas null */}
      {error && <Alert type="error" title="Erreur" message={error} className="mb-4" />}
      {success && <Alert type="success" title="Succès" message={success} className="mb-4" />}

      <form onSubmit={handleSubmit(handleFormSubmit)}>
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
                  {...register('firstName')}
                  className={`mt-1 block w-full border ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm`}
                />
                {errors.firstName && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.firstName.message}
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
                  {...register('lastName')}
                  className={`mt-1 block w-full border ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm`}
                />
                {errors.lastName && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.lastName.message}
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
                  {...register('email')}
                  className={`mt-1 block w-full border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  type="text"
                  id="phone"
                  {...register('phone')}
                  className={`mt-1 block w-full border ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  } rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm`}
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-10 md:grid md:grid-cols-3 md:gap-6">
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
                  {...register('companyName')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                />
              </div>

              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Logo de l&apos;entreprise
                </label>
                <div className="mt-1 flex items-center">
                  <div className="inline-block h-24 w-24 overflow-hidden rounded-md bg-gray-100">
                    {logoPreview && isValidImageUrl(logoPreview) ? (
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
                  {...register('description')}
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
                            {...register('specialties')}
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

        <div className="mt-10 border-t border-gray-200 pt-10 md:grid md:grid-cols-3 md:gap-6">
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
                  {...register('address.street')}
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
                  {...register('address.city')}
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
                  {...register('address.postalCode')}
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
                  {...register('address.country')}
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

        <div className="mt-10 border-t border-gray-200 pt-6">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default React.memo(ProfileForm);
