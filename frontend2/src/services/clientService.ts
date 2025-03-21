import api from '../utils/api';
import { Client } from '../types/client';

export const clientService = {
  getClients: async () => {
    const response = await api.get('/clients');
    return response.data;
  },

  getClientById: async (id: string) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  createClient: async (clientData: Omit<Client, 'id'>) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  updateClient: async (id: string, clientData: Partial<Client>) => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  deleteClient: async (id: string) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
};

export default clientService;
