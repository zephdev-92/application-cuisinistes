import api from '../utils/api';
import { Showroom } from '../types/showroom';
import { ApiResponse } from '../types/provider';

// Service pour les showrooms
export const ShowroomService = {
  // Récupérer tous les showrooms
  getAll: async (): Promise<Showroom[]> => {
    try {
      const response = await api.get<ApiResponse<Showroom[]>>('/showrooms');
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erreur lors de la récupération des showrooms');
      }
      return response.data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des showrooms:', error);
      throw error;
    }
  },

  // Récupérer un showroom par ID
  getById: async (id: string): Promise<Showroom> => {
    try {
      const response = await api.get<ApiResponse<Showroom>>(`/showrooms/${id}`);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || `Erreur lors de la récupération du showroom ${id}`);
      }
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du showroom ${id}:`, error);
      throw error;
    }
  }
};
