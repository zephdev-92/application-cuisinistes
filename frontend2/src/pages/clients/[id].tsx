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
  email: yup.string().email('Email invalide').required('L\'email est requis'),
  phone: yup.string().required('Le téléphone est requis'),
  address: yup.object().shape({
    street: yup.string().required(),
    city: yup.string().required(),
    postalCode: yup.string().required(),
    country: yup.string().required()
  }),
  notes: yup.string().required()
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
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
      notes: '',
    },
  });

  // Charger le client au montage
  useEffect(() => {
    let isMounted = true; // Pour éviter les mises à jour si le composant est démonté

    if (id && typeof id === 'string') {
      // On ne recharge le client que si on n'a pas déjà un client avec cet ID
      if (!client || client._id !== id) {
        getClientById(id)
          .then((fetchedClient) => {
            if (isMounted) { // Vérifiez que le composant est toujours monté
              reset({
                firstName: fetchedClient.firstName,
                lastName: fetchedClient.lastName,
                email: fetchedClient.email,
                phone: fetchedClient.phone || '',
                address: {
                  street: fetchedClient.address?.street || '',
                  city: fetchedClient.address?.city || '',
                  postalCode: fetchedClient.address?.postalCode || '',
                  country: fetchedClient.address?.country || 'France',
                },
                notes: fetchedClient.notes || '',
              });
            }
          })
          .catch((error) => {
            if (isMounted) {
              console.error('Erreur lors du chargement du client:', error);
            }
          });
      }
    }

    // Fonction de nettoyage
    return () => {
      isMounted = false;
    };
  }, [id, reset, client, getClientById]);


  // Mettre à jour le client
  const onSubmit = async (data: ClientFormData) => {
    if (id && typeof id === 'string') {
      try {
        await updateClient(id, data);
        setSuccess('Client mis à jour avec succès');
        setTimeout(() => setSuccess(null), 3000);
        setIsEditing(false);
      } catch {
        // L'erreur est déjà gérée par le hook
      }
    }
  };

  if (loading && !client) {
    return (
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-64 items-center justify-center">
            <div className="loader">Chargement...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            {client ? `${client.firstName} ${client.lastName}` : 'Détails du client'}
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => router.back()}
              className="rounded-md bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200"
            >
              Retour
            </button>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
          country: client.address?.country || 'France',  // Ajout du pays
        },
        notes: client.notes || '',
      });
    }
  }}
  className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
  >
  Annuler
</button>
            )}
          </div>
        </div>

        {/* Message d'erreur ou de succès */}
        {error && <Alert type="error" title="Erreur" message={error} className="mt-4" />}

        {success && <Alert type="success" title="Succès" message={success} className="mt-4" />}

        <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-lg">
          {isEditing ? (
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Prénom
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="firstName"
                        {...register('firstName')}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
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
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
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
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
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
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="address.street"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Rue
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="address.street"
                        {...register('address.street')}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address.city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Ville
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="address.city"
                        {...register('address.city')}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address.postalCode"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Code postal
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="address.postalCode"
                        {...register('address.postalCode')}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address.country"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Pays
                    </label>
                    <div className="mt-1">
                      <select
                        id="address.country"
                        {...register('address.country')}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
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
          ) : (
            <div>
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {client?.firstName} {client?.lastName}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {client?.email}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {client?.phone || 'Non renseigné'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {client?.address?.street ? (
                      <>
                        {client.address.street}
                        <br />
                        {client.address.postalCode} {client.address.city}
                        <br />
                        {client.address.country}
                      </>
                    ) : (
                      'Non renseignée'
                    )}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {client?.notes || 'Aucune note'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Date d&apos;ajout</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
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
          <div className="mt-4 overflow-hidden bg-white p-6 shadow sm:rounded-lg">
            <p className="text-gray-500">Aucun projet associé à ce client pour le moment.</p>
            <button
              className="mt-4 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              onClick={() => router.push('/projects/new?client=' + id)}
            >
              <svg
                className="mr-2 -ml-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
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
  <DashboardLayout>{page}</DashboardLayout>
);

export default ClientDetailPage;
