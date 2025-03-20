import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useClients, Client, ClientFormData } from '@/hooks/useClients';
import { Alert } from '@/components/ui/Alert';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { debounce } from 'lodash';
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

const ClientsPage: PageWithLayout = () => {
  const router = useRouter();
  const {
    clients,
    loading,
    error,
    pagination,
    getClients,
    createClient,
    deleteClient,
    searchClients
  } = useClients();

  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Charger les clients au montage
  useEffect(() => {
    getClients(currentPage, 10);
  }, [currentPage, getClients]);

  // Fonction de recherche avec debounce
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length >= 2) {
        const results = await searchClients(query);
        setSearchResults(results);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300),
    [searchClients]
  );

  // Gérer le changement de la recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Sélectionner un résultat de recherche
  const handleSelectSearchResult = (client: Client) => {
    setSearchQuery(`${client.firstName} ${client.lastName}`);
    setShowSearchResults(false);
    router.push(`/clients/${client._id}`);
  };

  // Créer un nouveau client
  const onSubmit = async (data: ClientFormData) => {
    try {
      await createClient(data);
      setModalOpen(false);
      reset();
      setSuccess('Client créé avec succès');
      setTimeout(() => setSuccess(null), 3000);
      getClients(1, 10); // Recharger la première page
    } catch (err) {
      // L'erreur est déjà gérée par le hook
    }
  };

  // Confirmer la suppression d'un client
  const handleDeleteConfirm = async () => {
    if (confirmDelete) {
      try {
        await deleteClient(confirmDelete);
        setConfirmDelete(null);
        setSuccess('Client supprimé avec succès');
        setTimeout(() => setSuccess(null), 3000);
        getClients(currentPage); // Recharger la page actuelle
      } catch (err) {
        // L'erreur est déjà gérée par le hook
      }
    }
  };

  // Changer de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Ajouter un client
          </button>
        </div>

        {/* Message d'erreur ou de succès */}
        {error && (
          <Alert type="error" title="Erreur" message={error} className="mt-4" />
        )}

        {success && (
          <Alert type="success" title="Succès" message={success} className="mt-4" />
        )}

        {/* Barre de recherche */}
        <div className="mt-6 relative">
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Résultats de recherche */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
              <ul className="max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                {searchResults.map((client) => (
                  <li
                    key={client._id}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                    onMouseDown={() => handleSelectSearchResult(client)}
                  >
                    <div className="flex items-center">
                      <span className="font-medium block truncate">
                        {client.firstName} {client.lastName}
                      </span>
                    </div>
                    <span className="text-gray-500 block truncate">{client.email}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Liste des clients */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          {loading && clients.length === 0 ? (
            <div className="py-10 text-center">
              <div className="loader">Chargement...</div>
            </div>
          ) : clients.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              Aucun client trouvé. Ajoutez votre premier client.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {clients.map((client) => (
                <li key={client._id}>
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {client.firstName} {client.lastName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">{client.email}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/clients/${client._id}`)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md text-sm"
                          >
                            Détails
                          </button>
                          <button
                            onClick={() => setConfirmDelete(client._id)}
                            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          {client.phone && (
                            <p className="flex items-center text-sm text-gray-500">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                              {client.phone}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Ajouté le{' '}
                            {new Date(client.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Précédent
            </button>
            <span>
              Page {currentPage} sur {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}

        {/* Modal pour créer un client */}
        {modalOpen && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Ajouter un client
                      </h3>
                      <div className="mt-2">
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

                          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button
                              type="submit"
                              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                            >
                              Ajouter
                            </button>
                            <button
                              type="button"
                              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                              onClick={() => setModalOpen(false)}
                            >
                              Annuler
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {confirmDelete && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Supprimer ce client
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Êtes-vous sûr de vouloir supprimer ce client ? Cette action ne peut pas être annulée.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleDeleteConfirm}
                  >
                    Supprimer
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setConfirmDelete(null)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Définir le layout pour cette page
ClientsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout title="Clients">{page}</DashboardLayout>
);

export default ClientsPage;
