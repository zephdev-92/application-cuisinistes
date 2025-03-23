import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Alert } from '@/components/ui/Alert';
import ClientsList from '@/components/clients/ClientsList';
import ClientForm from '@/components/clients/ClientForm';
import ClientSearch from '@/components/clients/ClientSearch';
import { useClients, Client, ClientFormData } from '@/hooks/useClients';

type PageWithLayout = NextPage<Record<string, unknown>> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

const ClientsPage: PageWithLayout = () => {
  const {
    clients,
    loading,
    error,
    isEmpty,
    noSearchResults,
    searchTerm,
    pagination,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    searchClients
  } = useClients();

  const [success, setSuccess] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Charger les clients au montage du composant et quand la page change
  useEffect(() => {
    fetchClients(currentPage, 10);
  }, [currentPage, fetchClients]);

  const handleAddClient = () => {
    setSelectedClient(null);
    setIsFormOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedClient(null);
  };

  const handleSearch = useCallback((term: string) => {
    searchClients(term);
  }, [searchClients]);

  const handleFormSubmit = async (clientData: ClientFormData) => {
    try {
      if (selectedClient) {
        // Mise à jour d'un client existant
        await updateClient(selectedClient._id, clientData);
        setSuccess('Client mis à jour avec succès');
      } else {
        // Création d'un nouveau client
        await createClient(clientData);
        setSuccess('Client ajouté avec succès');
      }

      // Recharger la liste des clients
      fetchClients(currentPage, 10);
      setIsFormOpen(false);

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      // Les erreurs sont déjà gérées par le hook
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await deleteClient(clientId);
        setSuccess('Client supprimé avec succès');

        // Recharger la liste des clients
        fetchClients(currentPage, 10);

        // Effacer le message de succès après 3 secondes
        setTimeout(() => setSuccess(null), 3000);
      } catch {
        // Les erreurs sont déjà gérées par le hook
      }
    }
  };

  // Pour la pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Message à afficher quand aucun résultat n'est trouvé
  const renderNoResultsMessage = () => {
    if (noSearchResults) {
      return (
        <div className="p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun résultat trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aucun client ne correspond à votre recherche &quot;{searchTerm}&quot;.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des Clients</h1>
          <button
            data-add-client
            onClick={handleAddClient}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ajouter un client
          </button>
        </div>

        {error && <Alert type="error" title="Erreur" message={error} className="mt-4" />}
        {success && <Alert type="success" title="Succès" message={success} className="mt-4" />}

        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          {!isFormOpen && (
            <div className="p-4">
              <ClientSearch onSearch={handleSearch} />
            </div>
          )}

          {loading && !isFormOpen ? (
            <div className="p-6 text-center">
              <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
              </div>
            </div>
          ) : (
            !isFormOpen && (
              <>
                {noSearchResults
                  ? renderNoResultsMessage()
                  : (
                    <ClientsList
                      clients={clients}
                      onEdit={handleEditClient}
                      onDelete={handleDeleteClient}
                    />
                  )
                }

                {/* Pagination - afficher seulement si pas en mode recherche */}
                {!isEmpty && !noSearchResults && !searchTerm && pagination.pages > 1 && (
                  <div className="mt-6 flex justify-center pb-6">
                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`${
                            currentPage === page
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                          } relative inline-flex items-center border px-4 py-2 text-sm font-medium`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                )}
              </>
            )
          )}

          {isFormOpen && (
            <div className="p-6">
              <ClientForm
                client={selectedClient}
                onSubmit={handleFormSubmit as (data: ClientFormData) => void}
                onCancel={handleFormClose}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Définir le layout pour cette page
ClientsPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout title="Gestion des clients">{page}</DashboardLayout>
);

export default ClientsPage;
