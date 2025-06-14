import { create } from 'zustand';
import { ShowroomService } from '../services/showroom.service';
import { Showroom } from '../types/showroom';

interface ShowroomState {
  showrooms: Showroom[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchShowrooms: () => Promise<void>;
  clearError: () => void;
}

export const useShowroomStore = create<ShowroomState>((set) => ({
  showrooms: [],
  isLoading: false,
  error: null,

  // Récupérer tous les showrooms
  fetchShowrooms: async () => {
    set({ isLoading: true, error: null });
    try {
      const showrooms = await ShowroomService.getAll();
      set({ showrooms, isLoading: false });
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des showrooms:', error);
      const message = error instanceof Error ? error.message : 'Impossible de charger les showrooms. Veuillez réessayer.';
      set({
        error: message,
        isLoading: false
      });
    }
  },

  // Effacer les erreurs
  clearError: () => {
    set({ error: null });
  }
}));
