import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ClientFormData, Client } from '@/hooks/useClients';

// Schéma de validation pour le formulaire client
const clientSchema = yup.object().shape({
  firstName: yup.string().required('Le prénom est requis'),
  lastName: yup.string().required('Le nom est requis'),
  email: yup.string().email('Email invalide').required("L'email est requis"),
  phone: yup.string().required('Le téléphone est requis'),
  notes: yup.string().required(),
  address: yup.object().shape({
    street: yup.string().required(),
    city: yup.string().required(),
    postalCode: yup.string().required(),
    country: yup.string().required()
  })
});


interface ClientFormProps {
  client: Client | null;
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  loading: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSubmit, onCancel, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({ // Utilisez le type importé ici
    resolver: yupResolver(clientSchema),
    defaultValues: {
      firstName: client?.firstName || '',
      lastName: client?.lastName || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: {
        street: client?.address?.street || '',
        city: client?.address?.city || '',
        postalCode: client?.address?.postalCode || '',
        country: client?.address?.country || 'France',
      },
      notes: client?.notes || '',
    },
  });


  // Soumission du formulaire
  const handleFormSubmit = (formData: ClientFormData) => {
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {client ? 'Modifier le client' : 'Ajouter un client'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Remplissez les informations du client.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              Prénom
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="firstName"
                {...register('firstName')}
                className={`block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.firstName && (
              <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="lastName"
                {...register('lastName')}
                className={`block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.lastName && (
              <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                {...register('email')}
                className={`block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Téléphone
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="phone"
                {...register('phone')}
                className={`block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <div className="mt-1">
              <textarea
                id="notes"
                rows={3}
                {...register('notes')}
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Informations supplémentaires concernant ce client.
            </p>
          </div>

          <div className="sm:col-span-6">
            <h4 className="font-medium text-gray-900">Adresse</h4>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">
              Rue
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="street"
                {...register('address.street')}
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              Ville
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="city"
                {...register('address.city')}
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
              Code postal
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="postalCode"
                {...register('address.postalCode')}
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Pays
            </label>
            <div className="mt-1">
              <select
                id="country"
                {...register('address.country')}
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="France">France</option>
                <option value="Belgique">Belgique</option>
                <option value="Suisse">Suisse</option>
                <option value="Luxembourg">Luxembourg</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : client ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ClientForm;
