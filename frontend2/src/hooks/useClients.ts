import { useState, useCallback } from 'react';
import axios from 'axios';
import { apiClient } from '@/lib/apiClient';
import {
  Client,
  PaginatedClientsResponse,
  ClientResponse,
  ClientFormData
} from '@/types/client';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Fonction utilitaire pour créer un client vide
const createEmptyClient = (): Client => ({
  _id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  createdAt: new Date(),
  updatedAt: new Date()
});

export function useClients(initialPage = 1, initialLimit = 10) {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0,
  });
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const [noSearchResults, setNoSearchResults] = useState<boolean>(false);

  // Fonction utilitaire pour gérer les erreurs d'API
  const handleApiError = (err: unknown, defaultMessage: string): string => {
    console.error(defaultMessage, err);

    if (axios.isAxiosError(err)) {
      // Gestion spécifique d'erreurs réseau
      if (err.code === 'ERR_NETWORK') {
        return "Le serveur n'est pas accessible. Vérifiez votre connexion et que l'API est bien lancée.";
      }

      // Erreur avec une réponse du serveur
      if (err.response) {
        const status = err.response.status;

        // Gérer les cas d'erreurs HTTP spécifiques
        switch (status) {
          case 401:
            return "Vous n'êtes pas autorisé à accéder à cette ressource. Veuillez vous reconnecter.";
          case 403:
            return "Accès refusé. Vous n'avez pas les droits nécessaires.";
          case 404:
            return "La ressource demandée n'existe pas.";
          case 500:
            return "Erreur interne du serveur. Veuillez réessayer plus tard.";
          default:
            return `Erreur ${status}: ${err.response.statusText || 'Erreur inconnue'}`;
        }
      }

      // Erreur sans réponse du serveur
      return "Erreur de connexion au serveur. Vérifiez votre connexion réseau.";
    }

    // Pour les autres types d'erreurs
    return err instanceof Error ? err.message : defaultMessage;
  };

  // Récupérer la liste des clients avec pagination
  const fetchClients = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<PaginatedClientsResponse>(`/clients?page=${page}&limit=${limit}`);

      if (response.data.success) {
        const { data, pagination: paginationData } = response.data;
        setClients(data);
        setFilteredClients(data); // Initialiser les clients filtrés avec tous les clients
        setPagination({
          page,
          limit,
          total: paginationData.total,
          pages: paginationData.pages
        });
        setIsEmpty(data.length === 0);
        setNoSearchResults(false); // Réinitialiser l'état de recherche sans résultats
      } else {
        throw new Error('Erreur lors de la récupération des clients');
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'Erreur lors du chargement des clients');
      setError(errorMessage);
      setClients([]);
      setFilteredClients([]);
      setIsEmpty(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour rechercher des clients
  const searchClients = useCallback((searchTerm: string) => {
    setSearchTerm(searchTerm);

    if (!searchTerm.trim()) {
      // Si la recherche est vide, afficher tous les clients
      setFilteredClients(clients);
      setNoSearchResults(false);
      return;
    }

    // Filtrer les clients selon le terme de recherche
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    const results = clients.filter(client =>
      client.firstName.toLowerCase().includes(normalizedSearchTerm) ||
      client.lastName.toLowerCase().includes(normalizedSearchTerm) ||
      client.email.toLowerCase().includes(normalizedSearchTerm) ||
      (client.phone && client.phone.includes(normalizedSearchTerm))
    );

    setFilteredClients(results);
    setNoSearchResults(results.length === 0);
  }, [clients]);

  // Récupérer un client par son ID
  const getClientById = useCallback(async (id: string): Promise<Client> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<ClientResponse>(`/clients/${id}`);

      if (response.data.success) {
        setClient(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Erreur lors de la récupération du client');
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'Erreur lors du chargement du client');
      setError(errorMessage);

      // Retourne un client vide mais valide pour éviter les erreurs en cascade
      return createEmptyClient();
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un nouveau client
  const createClient = async (clientData: ClientFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<ClientResponse>('/clients', clientData);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Erreur lors de la création du client');
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'Erreur lors de la création du client');
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un client existant
  const updateClient = async (id: string, clientData: ClientFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.put<ClientResponse>(`/clients/${id}`, clientData);

      if (response.data.success) {
        setClient(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Erreur lors de la mise à jour du client');
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'Erreur lors de la mise à jour du client');
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un client
  const deleteClient = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.delete(`/clients/${id}`);

      if (response.data.success) {
        return true;
      } else {
        throw new Error('Erreur lors de la suppression du client');
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'Erreur lors de la suppression du client');
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir la liste des clients
  const refetch = () => fetchClients(pagination.page, pagination.limit);

  return {
    clients: filteredClients, // Retourner les clients filtrés au lieu de tous les clients
    allClients: clients, // Garder accès à tous les clients si nécessaire
    client,
    loading,
    error,
    isEmpty,
    noSearchResults,
    searchTerm,
    pagination,
    fetchClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
    refetch
  };
}

// Export the Client type
export type { Client, ClientFormData };
