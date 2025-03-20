// Mise à jour dans useClients.ts, dans la fonction getClients

// Obtenir tous les clients
const getClients = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Tentative de récupération des clients: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/clients?page=${page}&limit=${limit}`);

      const response = await apiClient.get(`/clients?page=${page}&limit=${limit}`);
      console.log('Réponse reçue:', response.data);

      setClients(response.data.data);
      setPagination(response.data.pagination);
      return response.data;
    } catch (err: unknown) {
      console.error('Erreur complète:', err);

      const error = err as AxiosError<ApiErrorResponse>;

      // Gestion des erreurs réseau
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        const errorMessage = 'Erreur de connexion au serveur. Veuillez vérifier que le backend est bien démarré.';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Gestion des autres erreurs
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.errors?.[0]?.msg ||
                          `Erreur: ${error.message || 'Une erreur est survenue lors de la récupération des clients'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
