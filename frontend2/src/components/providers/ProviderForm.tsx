import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProviderStore } from '../../store/providerStore';
import {
  Provider,
  CreateProviderData,
  UpdateProviderData
} from '../../services/provider.service';
import { useShowroomStore } from '../../store/showroomStore'; // À créer selon besoin

interface ProviderFormProps {
  provider?: Provider; // Prestataire existant pour modification, undefined pour création
  isEdit?: boolean;
}

const ProviderForm: React.FC<ProviderFormProps> = ({ provider, isEdit = false }) => {
  const router = useRouter();
  const { isLoading, error, createProvider, updateProvider, clearError } = useProviderStore();
  const { showrooms } = useShowroomStore(); // Store à créer pour gérer les showrooms

  // États du formulaire
  const [formData, setFormData] = useState<CreateProviderData | UpdateProviderData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialties: [],
    showrooms: []
  });

  const [passwordVisible, setPasswordVisible] = useState(false); // Gardé pour les futures fonctionnalités
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Liste prédéfinie de spécialités courantes
  const commonSpecialties = [
    'Mesureur',
    'Poseur',
    'Livreur',
    'Électricien',
    'Plombier',
    'Maçon',
    'Peintre'
  ];

  // Initialiser le formulaire avec les données du prestataire si en mode édition
  useEffect(() => {
    if (isEdit && provider) {
      const { firstName, lastName, email, phone, specialties, showrooms } = provider;
      setFormData({
        firstName,
        lastName,
        email,
        phone,
        specialties: specialties || [],
        showrooms: showrooms?.map(s => s._id) || []
      });
    }
  }, [isEdit, provider]);

  // Gérer les changements de champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur quand l'utilisateur corrige le champ
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Gérer les changements de spécialités (cases à cocher)
  const handleSpecialtyChange = (specialty: string) => {
    setFormData(prev => {
      const specialties = [...(prev.specialties || [])];

      if (specialties.includes(specialty)) {
        return {
          ...prev,
          specialties: specialties.filter(s => s !== specialty)
        };
      } else {
        return {
          ...prev,
          specialties: [...specialties, specialty]
        };
      }
    });
  };

  // Ajouter une spécialité personnalisée
  const addCustomSpecialty = () => {
    if (customSpecialty.trim() && !(formData.specialties || []).includes(customSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...(prev.specialties || []), customSpecialty.trim()]
      }));
      setCustomSpecialty('');
    }
  };

  // Gérer les changements de showrooms (select multiple)
  const handleShowroomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      showrooms: selectedOptions
    }));
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      errors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName?.trim()) {
      errors.lastName = 'Le nom est requis';
    }

    if (!formData.email?.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    if (!formData.phone?.trim()) {
      errors.phone = 'Le téléphone est requis';
    } else if (!/^[0-9+\s()-]{8,15}$/.test(formData.phone)) {
      errors.phone = 'Format de téléphone invalide';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      if (isEdit && provider) {
        // Mise à jour d'un prestataire existant
        await updateProvider(provider._id, formData as UpdateProviderData);
        setSuccessMessage('Prestataire mis à jour avec succès!');
        setTimeout(() => {
          router.push('/prestataires');
        }, 1500);
      } else {
        // Création d'un nouveau prestataire
        await createProvider(formData as CreateProviderData);
        setSuccessMessage('Prestataire ajouté avec succès!');
        setTimeout(() => {
          router.push('/prestataires');
        }, 1500);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Modifier le prestataire' : 'Ajouter un prestataire'}
      </h1>

      {/* Message de succès */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prénom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">
              Prénom *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.firstName && (
              <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
            )}
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
              Nom *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.lastName && (
              <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
              Téléphone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.phone && (
              <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
            )}
          </div>
        </div>

        {/* Spécialités */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spécialités
          </label>

          <div className="mb-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {commonSpecialties.map((specialty) => (
              <div key={specialty} className="flex items-center">
                <input
                  type="checkbox"
                  id={`specialty-${specialty}`}
                  checked={(formData.specialties || []).includes(specialty)}
                  onChange={() => handleSpecialtyChange(specialty)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`specialty-${specialty}`} className="ml-2 text-sm text-gray-700">
                  {specialty}
                </label>
              </div>
            ))}
          </div>

          <div className="flex mt-3">
            <input
              type="text"
              value={customSpecialty}
              onChange={(e) => setCustomSpecialty(e.target.value)}
              placeholder="Ajouter une autre spécialité"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomSpecialty();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomSpecialty}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
            >
              Ajouter
            </button>
          </div>

          {/* Liste des spécialités sélectionnées */}
          {(formData.specialties || []).length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-700 mb-2">Spécialités sélectionnées:</p>
              <div className="flex flex-wrap gap-2">
                {(formData.specialties || []).map((specialty, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center"
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => handleSpecialtyChange(specialty)}
                      className="ml-1 text-blue-800 hover:text-blue-900 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Showrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="showrooms">
            Showrooms
          </label>
          <select
            id="showrooms"
            name="showrooms"
            multiple
            value={formData.showrooms || []}
            onChange={handleShowroomChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            size={4}
          >
            {showrooms.map((showroom) => (
              <option key={showroom._id} value={showroom._id}>
                {showroom.name} ({showroom.address.city})
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Utilisez Ctrl+clic (ou Cmd+clic sur Mac) pour sélectionner plusieurs showrooms
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/prestataires')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traitement...
              </span>
            ) : (
              <span>{isEdit ? 'Mettre à jour' : 'Ajouter'}</span>
            )}
          </button>
        </div>
      </form>

      {!isEdit && (
        <div className="mt-6 bg-blue-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Information</h3>
          <p className="text-blue-700">
            Le prestataire recevra un email l'invitant à finaliser son inscription et à définir son mot de passe.
            Aucun mot de passe n'est requis lors de la création.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProviderForm;
