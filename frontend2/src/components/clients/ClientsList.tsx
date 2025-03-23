// Supposons que ce fichier est à '@/components/clients/ClientsList.tsx'
import React from 'react';
import Link from 'next/link';
import { Client } from '@/types/client';

interface ClientsListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

const ClientsList: React.FC<ClientsListProps> = ({ clients, onEdit, onDelete }) => {
  // Vérifier si la liste des clients est vide
  const isEmpty = clients.length === 0;

  if (isEmpty) {
    return (
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
        <button
          onClick={() => document.querySelector<HTMLButtonElement>('[data-add-client]')?.click()}
          className="rounded-md bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600"
        >
          Ajouter votre premier client
        </button>
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Nom
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Email
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Téléphone
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {clients.map((client) => (
          <tr key={client._id}>
            <td className="whitespace-nowrap px-6 py-4">
              <div className="font-medium text-gray-900">
                {client.lastName} {client.firstName}
              </div>
            </td>
            <td className="whitespace-nowrap px-6 py-4">
              <div className="text-gray-500">{client.email}</div>
            </td>
            <td className="whitespace-nowrap px-6 py-4">
              <div className="text-gray-500">{client.phone || '-'}</div>
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
              <Link href={`/clients/${client._id}`}>
                <button className="mr-3 text-blue-600 hover:text-blue-900">Voir</button>
              </Link>
              <button
                onClick={() => onEdit(client)}
                className="mr-3 text-green-600 hover:text-green-900"
              >
                Modifier
              </button>
              <button
                onClick={() => onDelete(client._id)}
                className="text-red-600 hover:text-red-900"
              >
                Supprimer
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ClientsList;
