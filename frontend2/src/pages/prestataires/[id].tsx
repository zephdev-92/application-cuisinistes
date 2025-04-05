  
// frontend/src/pages/prestataires/modifier/[id].tsx
import React, { useEffect } from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout'; // À créer selon votre structure
import ProviderForm from '../../components/providers/ProviderForm';
import { useProviderStore } from '../../store/providerStore';

const EditProviderPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const {
    selectedProvider,
    isLoading,
    error,
    getProviderById,
    clearError
  } = useProviderStore();

  useEffect(() => {
    if (id && typeof id === 'string') {
      getProviderById(id);
    }

    // Nettoyage à la sortie
    return () => {
      clearError();
    };
  }, [id, getProviderById, clearError]);

  return (
    <DashboardLayout>
      <Head>
        <title>Modifier un Prestataire | Gestion Cuisinistes</title>
        <meta name="description" content="Modifier les informations d'un prestataire" />
      </Head>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            &larr; Retour
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center h-64">
            <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
              <p className="mt-2">
                <button
                  onClick={() => router.push('/prestataires')}
                  className="text-red-700 font-medium underline"
                >
                  Retour à la liste des prestataires
                </button>
              </p>
            </div>
          </div>
        ) : selectedProvider ? (
          <ProviderForm provider={selectedProvider} isEdit={true} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-700">Prestataire non trouvé</p>
            <button
              onClick={() => router.push('/prestataires')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Retour à la liste des prestataires
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditProviderPage;
