// frontend/src/pages/clients/[id].tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useClients, ClientFormData } from '@/hooks/useClients';
import { Alert } from '@/components/ui/Alert';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { NextPage } from 'next';

// Schéma de validation pour le formulaire client
const clientSchema = yup.object().shape({
  firstName: yup.string().required('Le prénom est requis'),
  lastName: yup.string().required('Le nom est requis'),
  email: yup.string().email('Email invalide').required("L'email est requis"),
  phone: yup.string().optional(),
  'address.street': yup.string().optional(),
  'address.city': yup.string().optional(),
  'address.postalCode': yup.string().optional(),
  'address.country': yup.string().optional(),
  notes: yup.string().optional()
});

type PageWithLayout = NextPage<Record<string, unknown>> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

const ClientDetailPage: PageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const { getClientById, updateClient, loading, error, client } = useClients();
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Configuration du formulaire
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientFormData>({
    resolver: yupResolver(clientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: 'France'
      },
      notes: ''
    }
  });

  // Charger le client au montage
  useEffect(() => {
    if (id && typeof id === 'string') {
      getClientById(id)
        .then(client => {
          reset({
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            phone: client.phone || '',
            address: {
              street: client.address?.street || '',
              city: client.address?.city || '',
              postalCode: client.address?.postalCode || '',
              country: client.address?.country || 'France'
            },
            notes: client.notes || ''
          });
        })
        .catch(error => {
          console.error("Erreur lors du chargement du client:", error);
        });
    }
  }, [id, getClientById, reset]);

  // Mettre à jour le client
  const onSubmit = async (data: ClientFormData) => {
    if (id && typeof id === 'string') {
      try {
        await updateClient(id, data);
        setSuccess('Client mis à jour avec succès');
        setTimeout(() => setSuccess(null), 3000);
        setIsEditing(false);
      } catch (err) {
        // L'erreur est déjà gérée par le hook
      }
    }
  };

  if (loading && !client) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="loader">Chargement...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            {client ? `${client.firstName} ${client.lastName}` : 'Détails du client'}
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => router.back()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
            >
              Retour
            </button>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Modifier
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(false);
                  if (client) {
                    reset({
                      firstName: client.firstName,
                      lastName: client.lastName,
                      email: client.email,
                      phone: client.phone || '',
                      address: {
                        street: client.address?.street || '',
                        city: client.address?.city || '',
                        postalCode: client.address?.postalCode || '',
                        country: client.address?.country || 'France'
                      },
                      notes: client.notes || ''
                    });
                  }
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                Annuler
              </button>
            )}
          </div>
        </div>

        {/* Message d'erreur ou de succès */}
        {error && (
          <Alert type="error" title="Erreur" message={error} className="mt-4" />
        )}

        {success && (
          <Alert type="success" title="Succès" message={success} className="mt-4" />
        )}

        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          {isEditing ? (
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit(onSubmit)}>
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
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.firstName ? 'border-red-300' : ''
                        }`}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>
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
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.lastName ? 'border-red-300' : ''
                        }`}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        id="email"
                        {...register('email')}
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.email ? 'border-red-300' : ''
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Téléphone
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        id="phone"
                        {...register('phone')}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                      Rue
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="address.street"
                        {...register('address.street')}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                      Ville
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="address.city"
                        {...register('address.city')}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700">
                      Code postal
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="address.postalCode"
                        {...register('address.postalCode')}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                      Pays
                    </label>
                    <div className="mt-1">
                      <select
                        id="address.country"
                        {...register('address.country')}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="France">France</option>
                        <option value="Belgique">Belgique</option>
                        <option value="Suisse">Suisse</option>
                        <option value="Luxembourg">Luxembourg</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="notes"
                        {...register('notes')}
                        rows={3}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client?.firstName} {client?.lastName}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client?.email}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client?.phone || 'Non renseigné'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client?.address?.street ? (
                      <>
                        {client.address.street}<br />
                        {client.address.postalCode} {client.address.city}<br />
                        {client.address.country}
                      </>
                    ) : (
                      'Non renseignée'
                    )}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client?.notes || 'Aucune note'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Date d'ajout</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client?.createdAt ? new Date(client.createdAt).toLocaleDateString() : '-'}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Projets associés - Sera implémenté plus tard */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Projets associés</h2>
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <p className="text-gray-500">Aucun projet associé à ce client pour le moment.</p>
            <button
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => router.push('/projects/new?client=' + id)}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Créer un projet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Définir le layout pour cette page
ClientDetailPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout title="Détails du client">{page}</DashboardLayout>
);

export default ClientDetailPage;
