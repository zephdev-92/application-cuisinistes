import api from '../utils/api';
import {
  Provider,
  CreateProviderData,
  UpdateProviderData,
  ApiResponse
} from '../types/provider';

export type { Provider, CreateProviderData, UpdateProviderData };

// Service pour les prestataires
export const ProviderService = {
  // Récupérer tous les prestataires
  getAll: async (): Promise<Provider[]> => {
    try {
      const response = await api.get<ApiResponse<Provider[]>>('/providers');
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erreur lors de la récupération des prestataires');
      }
      return response.data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des prestataires:', error);
      throw error;
    }
  },

  // Rechercher des prestataires par terme de recherche
  search: async (query: string): Promise<Provider[]> => {
    try {
      const response = await api.get<ApiResponse<Provider[]>>(`/providers/search?query=${encodeURIComponent(query)}`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erreur lors de la recherche de prestataires');
      }
      return response.data.data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche de prestataires:', error);
      throw error;
    }
  },

  // Récupérer un prestataire par ID
  getById: async (id: string): Promise<Provider> => {
    try {
      const response = await api.get<ApiResponse<Provider>>(`/providers/${id}`);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || `Erreur lors de la récupération du prestataire ${id}`);
      }
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du prestataire ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau prestataire
  create: async (providerData: CreateProviderData): Promise<Provider> => {
    try {
      const response = await api.post<ApiResponse<Provider>>('/providers', providerData);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Erreur lors de la création du prestataire');
      }
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la création du prestataire:', error);
      throw error;
    }
  },

  // Mettre à jour un prestataire existant
  update: async (id: string, providerData: UpdateProviderData): Promise<Provider> => {
    try {
      const response = await api.put<ApiResponse<Provider>>(`/providers/${id}`, providerData);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || `Erreur lors de la mise à jour du prestataire ${id}`);
      }
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du prestataire ${id}:`, error);
      throw error;
    }
  },

  // Supprimer (désactiver) un prestataire
  delete: async (id: string): Promise<{ id: string }> => {
    try {
      const response = await api.delete<ApiResponse<{ id: string }>>(`/providers/${id}`);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || `Erreur lors de la suppression du prestataire ${id}`);
      }
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du prestataire ${id}:`, error);
      throw error;
    }
  }
};
