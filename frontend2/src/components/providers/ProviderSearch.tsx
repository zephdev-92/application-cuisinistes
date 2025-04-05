import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiSearch, FiUser, FiX } from 'react-icons/fi';
import { useProviderStore } from '../../store/providerStore';
import { Provider } from '../../services/provider.service';

interface ProviderSearchProps {
  onSelect: (provider: Provider) => void;
  onCancel: () => void;
}

const ProviderSearch: React.FC<ProviderSearchProps> = ({ onSelect, onCancel }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const {
    filteredProviders,
    isLoading,
    error,
    searchProviders,
    clearError
  } = useProviderStore();

  // Effectuer la recherche quand le terme change
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      setIsSearching(true);
      const delayDebounceFn = setTimeout(() => {
        searchProviders(searchTerm);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else if (searchTerm.trim() === '') {
      searchProviders('');
      setIsSearching(false);
    }
  }, [searchTerm, searchProviders]);

  // Gérer la sélection d'un prestataire
  const handleProviderSelect = (provider: Provider) => {
    onSelect(provider);
    setSearchTerm('');
    setIsSearching(false);
  };

  // Effacer la recherche
  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Rechercher un prestataire</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX size={24} />
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400"><FiSearch size={20} /></span>
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <FiX />
            </button>
          )}
        </div>
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

      {/* Résultats de recherche */}
      <div className="mt-2">
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
          </div>
        ) : isSearching && filteredProviders.length > 0 ? (
          <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {filteredProviders.map((provider) => (
              <li
                key={provider._id}
                className={`p-3 hover:bg-gray-50 cursor-pointer ${!provider.active ? 'opacity-60' : ''}`}
                onClick={() => handleProviderSelect(provider)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-500"><FiUser size={20} /></span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {provider.firstName} {provider.lastName}
                      {!provider.active && <span className="ml-2 text-red-500">(Inactif)</span>}
                    </p>
                    <p className="text-sm text-gray-500">{provider.email}</p>
                    {provider.specialties && provider.specialties.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {provider.specialties.slice(0, 3).map((specialty, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                        {provider.specialties.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{provider.specialties.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : searchTerm.trim().length >= 2 ? (
          <div className="py-6 text-center text-gray-500">
            Aucun prestataire trouvé pour "{searchTerm}"
          </div>
        ) : searchTerm.trim().length === 1 ? (
          <div className="py-6 text-center text-gray-500">
            Veuillez entrer au moins 2 caractères
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500">
            Commencez à taper pour rechercher un prestataire
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Annuler
        </button>
        <button
          onClick={() => router.push('/prestataires/ajouter')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Créer un nouveau prestataire
        </button>
      </div>
    </div>
  );
};

export default ProviderSearch;
