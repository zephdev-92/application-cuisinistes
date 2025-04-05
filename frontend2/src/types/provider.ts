
// Interface représentant un prestataire
export interface Provider {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    specialties: string[];
    showrooms: {
      _id: string;
      name: string;
      address: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
      };
    }[];
    profileCompleted: boolean;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  }

  // Interface pour la création d'un prestataire
  export interface CreateProviderData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialties: string[];
    showrooms: string[];
  }

  // Interface pour la mise à jour d'un prestataire
  export interface UpdateProviderData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    specialties?: string[];
    showrooms?: string[];
    active?: boolean;
  }

  // Interface pour les réponses API
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    details?: string;
  }
