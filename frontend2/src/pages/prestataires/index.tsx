import React from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout'; // À créer selon votre structure
import ProviderList from '../../components/providers/ProviderList';

const ProvidersPage: NextPage = () => {
  return (
    <DashboardLayout>
      <Head>
        <title>Prestataires | Gestion Cuisinistes</title>
        <meta name="description" content="Gestion des prestataires pour cuisinistes" />
      </Head>

      <div className="container mx-auto px-4 py-6">
        <ProviderList />
      </div>
    </DashboardLayout>
  );
};

export default ProvidersPage;
