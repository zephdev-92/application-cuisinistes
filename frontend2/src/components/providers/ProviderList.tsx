import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import { useProviderStore } from '../../store/providerStore';

const ProviderList: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const {
    providers,
    filteredProviders,
    isLoading,
    error,
    fetchProviders,
    searchProviders,
    deleteProvider,
    clearError
  } = useProviderStore();

  // Charger les prestataires au chargement du composant
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Gérer la recherche
  const handleSearch = () => {
    searchProviders(searchTerm);
  };

  // Effacer la recherche
  const clearSearch = () => {
    setSearchTerm('');
    searchProviders('');
  };

  // Gérer la touche Entrée pour la recherche
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Confirmer la suppression
  const confirmDelete = (id: string) => {
    setShowConfirmDelete(id);
  };

  // Annuler la suppression
  const cancelDelete = () => {
    setShowConfirmDelete(null);
  };

  // Exécuter la suppression
  const executeDelete = async (id: string) => {
    try {
      await deleteProvider(id);
      setShowConfirmDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Prestataires</h1>
        <Link href="/prestataires/ajouter" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
          <span className="mr-2"><FiPlus size={20} /></span> Ajouter un prestataire
        </Link>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6 flex">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Rechercher un prestataire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md flex items-center"
        >
          <span className="mr-2"><FiSearch size={20} /></span> Rechercher
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-700">
            <FiX />
          </button>
        </div>
      )}

      {/* Tableau des prestataires */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
        </div>
      ) : filteredProviders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Nom</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Téléphone</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Spécialités</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Statut</th>
                <th className="py-3 px-4 text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProviders.map((provider) => (
                <tr
                  key={provider._id}
                  className={`hover:bg-gray-50 ${!provider.active ? 'bg-gray-100 text-gray-500' : ''}`}
                >
                  <td className="py-3 px-4">
                    <Link href={`/prestataires/${provider._id}`} className="text-blue-600 hover:text-blue-800">
                      {provider.firstName} {provider.lastName}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{provider.email}</td>
                  <td className="py-3 px-4">{provider.phone}</td>
                  <td className="py-3 px-4">
                    {provider.specialties && provider.specialties.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {provider.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">Aucune spécialité</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        provider.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {provider.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center space-x-2">
                      <Link
                        href={`/prestataires/modifier/${provider._id}`}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                        title="Modifier"
                      >
                        <FiEdit2 />
                      </Link>

                      {showConfirmDelete === provider._id ? (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => executeDelete(provider._id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                            title="Confirmer"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                            title="Annuler"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => confirmDelete(provider._id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                          title={provider.active ? "Désactiver" : "Supprimer"}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-md p-8 text-center">
          <p className="text-gray-500">Aucun prestataire trouvé</p>
        </div>
      )}
    </div>
  );
};

export default ProviderList;
