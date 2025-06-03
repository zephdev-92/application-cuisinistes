import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title = 'Authentification' }) => {
  return (
    <>
      <Head>
        <title>{title} | Gestion Cuisinistes</title>
        <meta name="description" content="Plateforme de gestion pour cuisinistes et prestataires" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex min-h-screen flex-col bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <Link href="/" className="flex items-center">
                <span className="sr-only">Gestion Cuisinistes</span>
                {/* Remplacer par votre logo */}
                <div className="mr-2 h-8 w-8 rounded-full bg-blue-600"></div>
                <span className="text-lg font-semibold text-gray-900">Gestion Cuisinistes</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-grow">{children}</main>

        <footer className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
              <div className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Gestion Cuisinistes. Tous droits réservés.
              </div>
              <div className="flex space-x-6">
                <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">
                  Conditions d&apos;utilisation
                </Link>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">
                  Politique de confidentialité
                </Link>
                <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AuthLayout;
