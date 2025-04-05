import DashboardLayout from '@/components/layout/DashboardLayout';
// frontend/src/pages/prestataires/ajouter.tsx
import React from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
// À créer selon votre structure
import ProviderForm from '../../components/providers/ProviderForm';

const AddProviderPage: NextPage = () => {
  const router = useRouter();

  return (
    <DashboardLayout>
      <Head>
        <title>Ajouter un Prestataire | Gestion Cuisinistes</title>
        <meta name="description" content="Ajouter un nouveau prestataire" />
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

        <ProviderForm />
      </div>
    </DashboardLayout>
  );
};

export default AddProviderPage;
