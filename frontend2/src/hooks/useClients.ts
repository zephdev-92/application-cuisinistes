import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/router';

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface ApiErrorResponse {
  error: string;
}

export const useClients = (page = 1, limit = 10) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false); // Nouvel état pour indiquer si la liste est vide
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  const router = useRouter();

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);

      // Récupérer le token depuis le localStorage
      const token = localStorage.getItem('token');

      // Au lieu de lancer une erreur, redirigez vers la page de connexion
      if (!token) {
        // Stockez l'URL actuelle pour rediriger l'utilisateur après la connexion
        localStorage.setItem('redirectAfterLogin', router.asPath);

        // Rediriger vers la page de connexion
        router.push('/login');
        return; // Arrêtez l'exécution ici
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/clients?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setClients(response.data.data);
        setPagination(response.data.pagination);
        setIsEmpty(response.data.data.length === 0 && response.data.pagination.total === 0);
      } else {
        throw new Error(response.data.error || 'Une erreur est survenue');
      }
    } catch (error: unknown) {
      // Gérer spécifiquement les erreurs 401 (non autorisé)
      if (error instanceof AxiosError && error.response?.status === 401) {
        localStorage.removeItem('token'); // Supprimer le token invalide
        router.push('/login');
        return;
      }

      console.error('Erreur lors de la récupération des clients:', error);
      const axiosError = error as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.error ||
          'Une erreur est survenue lors de la récupération des clients'
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, router]);

  useEffect(() => {
    let isMounted = true;

    const getClients = async () => {
      try {
        await fetchClients();
      } catch (error) {
        if (isMounted) {
          console.error('Erreur dans useEffect:', error);
        }
      }
    };

    getClients();

    return () => {
      isMounted = false;
    };
  }, [fetchClients]);

  return { clients, loading, error, isEmpty, pagination, refetch: fetchClients };
};
