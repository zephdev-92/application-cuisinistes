// src/types/client.ts

/**
 * Interface représentant un client dans l'application
 */
export interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type pour la création d'un nouveau client
 * Exclut les champs générés automatiquement comme l'id et les timestamps
 */
export type CreateClientDto = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Type pour la mise à jour d'un client existant
 * Tous les champs sont optionnels
 */
export type UpdateClientDto = Partial<CreateClientDto>;

/**
 * Type pour la réponse paginée de l'API clients
 */
export interface PaginatedClientsResponse {
  success: boolean;
  count: number;
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
  data: Client[];
}

/**
 * Type pour la réponse d'un client unique
 */
export interface ClientResponse {
  success: boolean;
  data: Client;
}

/**
 * Interface pour les données du formulaire client
 * Utilisée partout où un formulaire client est nécessaire
 */
export interface ClientFormData {
 firstName: string;
 lastName: string;
 email: string;
 phone: string;
 address: {
   street: string;
   city: string;
   postalCode: string;
   country: string;
 };
 notes: string;
}
