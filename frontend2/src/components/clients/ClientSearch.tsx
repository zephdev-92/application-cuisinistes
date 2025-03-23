import React, { useState, useEffect } from 'react';

interface ClientSearchProps {
  onSearch: (searchTerm: string) => void;
}

const ClientSearch: React.FC<ClientSearchProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Effet pour déclencher la recherche quand le terme change
  useEffect(() => {
    // Utilisation d'un délai pour éviter trop d'appels pendant la frappe
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 300); // 300ms de délai

    // Nettoyage du timeout si le composant est démonté ou si searchTerm change à nouveau
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="relative mb-4">
      <div className="flex">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={handleChange}
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              title="Effacer la recherche"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientSearch;
