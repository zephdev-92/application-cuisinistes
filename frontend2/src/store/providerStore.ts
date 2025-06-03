import { create } from 'zustand';
import { ProviderService } from '../services/provider.service';
import {
  Provider,
  CreateProviderData,
  UpdateProviderData
} from '../types/provider';

interface ProviderState {
  providers: Provider[];
  filteredProviders: Provider[];
  selectedProvider: Provider | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProviders: () => Promise<void>;
  searchProviders: (query: string) => Promise<void>;
  getProviderById: (id: string) => Promise<void>;
  createProvider: (data: CreateProviderData) => Promise<Provider>;
  updateProvider: (id: string, data: UpdateProviderData) => Promise<Provider>;
  deleteProvider: (id: string) => Promise<void>;

  // Helpers
  setSelectedProvider: (provider: Provider | null) => void;
  clearError: () => void;
}

export const useProviderStore = create<ProviderState>((set, get) => ({
  providers: [],
  filteredProviders: [],
  selectedProvider: null,
  isLoading: false,
  error: null,

  // Récupérer tous les prestataires
  fetchProviders: async () => {
    set({ isLoading: true, error: null });
    try {
      const providers = await ProviderService.getAll();
      set({
        providers,
        filteredProviders: providers,
        isLoading: false
      });
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des prestataires:', error);
      const message = error instanceof Error ? error.message : 'Impossible de charger les prestataires. Veuillez réessayer.';
      set({
        error: message,
        isLoading: false
      });
    }
  },

  // Rechercher des prestataires
  searchProviders: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      if (!query.trim()) {
        // Si la recherche est vide, afficher tous les prestataires
        set({
          filteredProviders: get().providers,
          isLoading: false
        });
        return;
      }

      const providers = await ProviderService.search(query);
      set({
        filteredProviders: providers,
        isLoading: false
      });
    } catch (error: unknown) {
      console.error('Erreur lors de la recherche de prestataires:', error);
      const message = error instanceof Error ? error.message : 'Impossible de rechercher des prestataires. Veuillez réessayer.';
      set({
        error: message,
        isLoading: false
      });
    }
  },

  // Récupérer un prestataire par ID
  getProviderById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const provider = await ProviderService.getById(id);
      set({
        selectedProvider: provider,
        isLoading: false
      });
    } catch (error: unknown) {
      console.error(`Erreur lors de la récupération du prestataire ${id}:`, error);
      const message = error instanceof Error ? error.message : 'Impossible de récupérer les détails du prestataire. Veuillez réessayer.';
      set({
        error: message,
        isLoading: false
      });
    }
  },

  // Créer un nouveau prestataire
  createProvider: async (data: CreateProviderData) => {
    set({ isLoading: true, error: null });
    try {
      const newProvider = await ProviderService.create(data);

      set(state => ({
        providers: [...state.providers, newProvider],
        filteredProviders: [...state.filteredProviders, newProvider],
        selectedProvider: newProvider,
        isLoading: false
      }));

      return newProvider;
    } catch (error: unknown) {
      console.error('Erreur lors de la création du prestataire:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de créer le prestataire. Veuillez réessayer.';

      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  // Mettre à jour un prestataire existant
  updateProvider: async (id: string, data: UpdateProviderData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProvider = await ProviderService.update(id, data);

      set(state => ({
        providers: state.providers.map(p =>
          p._id === id ? updatedProvider : p
        ),
        filteredProviders: state.filteredProviders.map(p =>
          p._id === id ? updatedProvider : p
        ),
        selectedProvider: updatedProvider,
        isLoading: false
      }));

      return updatedProvider;
    } catch (error: unknown) {
      console.error(`Erreur lors de la mise à jour du prestataire ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de mettre à jour le prestataire. Veuillez réessayer.';

      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  // Supprimer (désactiver) un prestataire
  deleteProvider: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await ProviderService.delete(id);

      set(state => {
        // Mettre à jour les listes en désactivant le prestataire
        const updateProviderList = (providers: Provider[]) =>
          providers.map(p => p._id === id ? { ...p, active: false } : p);

        return {
          providers: updateProviderList(state.providers),
          filteredProviders: updateProviderList(state.filteredProviders),
          selectedProvider: state.selectedProvider?._id === id ?
            { ...state.selectedProvider, active: false } :
            state.selectedProvider,
          isLoading: false
        };
      });
    } catch (error: unknown) {
      console.error(`Erreur lors de la suppression du prestataire ${id}:`, error);
      const message = error instanceof Error ? error.message : 'Impossible de supprimer le prestataire. Veuillez réessayer.';
      set({
        error: message,
        isLoading: false
      });
    }
  },

  // Définir le prestataire sélectionné
  setSelectedProvider: (provider: Provider | null) => {
    set({ selectedProvider: provider });
  },

  // Effacer les erreurs
  clearError: () => {
    set({ error: null });
  }
}));
