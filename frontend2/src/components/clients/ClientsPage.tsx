import { useState } from 'react';
import { useClients } from '../../hooks/useClients';
import Link from 'next/link';
import axios from 'axios';

const ClientsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  // Utilisez le hook avec le nouvel état isEmpty
  const { clients, loading, error, isEmpty, pagination, refetch } = useClients(currentPage, 10);

  const handleDeleteClient = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refetch();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Pour la pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading)
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="relative rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        <strong className="font-bold">Erreur : </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des clients</h1>
        <Link href="/clients/new">
          <button className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            Ajouter un client
          </button>
        </Link>
      </div>

      {isEmpty ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <div className="mb-4 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold">Aucun client trouvé</h2>
          <p className="mb-6 text-gray-600">
            Vous n&apos;avez pas encore ajouté de clients à votre compte.
          </p>
          <Link href="/clients/new">
            <button className="rounded-md bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600">
              Ajouter votre premier client
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Tableau des clients existants */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {clients.map((client) => (
                  <tr key={client._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {client.lastName} {client.firstName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500">{client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500">{client.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <Link href={`/clients/${client._id}`}>
                        <button className="mr-3 text-blue-600 hover:text-blue-900">Voir</button>
                      </Link>
                      <Link href={`/clients/${client._id}/edit`}>
                        <button className="mr-3 text-green-600 hover:text-green-900">
                          Modifier
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDeleteClient(client._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex justify-center">
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
      )}
    </div>
  );
};

export default ClientsPage;
