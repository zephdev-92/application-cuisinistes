import { useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  error?: string;
  errors?: Array<{ msg: string }>;
}

export interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  notes?: string;
}

export interface PaginationData {
  total: number;
  page: number;
  pages: number;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    pages: 1
  });

  // Obtenir tous les clients
  const getClients = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/clients?page=${page}&limit=${limit}`);
      setClients(response.data.data);
      setPagination(response.data.pagination);
      return response.data;
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.errors?.[0]?.msg ||
                          'Une erreur est survenue lors de la récupération des clients';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Obtenir un client par ID
  const getClientById = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/clients/${id}`);
      setClient(response.data.data);
      return response.data.data;
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.errors?.[0]?.msg ||
                          'Une erreur est survenue lors de la récupération du client';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau client
  const createClient = async (data: ClientFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/clients', data);
      setClients(prevClients => [response.data.data, ...prevClients]);
      return response.data.data;
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.errors?.[0]?.msg ||
                          'Une erreur est survenue lors de la création du client';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un client
  const updateClient = async (id: string, data: Partial<ClientFormData>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.put(`/clients/${id}`, data);
      setClients(prevClients =>
        prevClients.map(c => c._id === id ? response.data.data : c)
      );
      if (client && client._id === id) {
        setClient(response.data.data);
      }
      return response.data.data;
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.errors?.[0]?.msg ||
                          'Une erreur est survenue lors de la mise à jour du client';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un client
  const deleteClient = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/clients/${id}`);
      setClients(prevClients => prevClients.filter(c => c._id !== id));
      if (client && client._id === id) {
        setClient(null);
      }
      return true;
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.errors?.[0]?.msg ||
                          'Une erreur est survenue lors de la suppression du client';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Rechercher des clients
  const searchClients = async (query: string) => {
    if (!query) return [];

    setLoading(true);
    try {
      const response = await apiClient.get(`/clients/search?query=${encodeURIComponent(query)}`);
      return response.data.data;
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.error('Erreur lors de la recherche:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    clients,
    client,
    loading,
    error,
    pagination,
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    searchClients
  };
};
