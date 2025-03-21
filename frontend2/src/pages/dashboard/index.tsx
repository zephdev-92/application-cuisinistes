import React from 'react';
import { useAuth, UserRole } from '@/contexts/auth.context';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';

type NextPageWithLayout<P = object> = React.FC<P> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

// Composant de carte pour le tableau de bord
interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  count?: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, icon, link, count }) => (
  <Link href={link} className="block">
    <div className="overflow-hidden rounded-lg bg-white shadow transition-shadow duration-200 hover:shadow-md">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">{icon}</div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {count !== undefined ? count : description}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <span className="font-medium text-blue-600 hover:text-blue-500">
            {count !== undefined ? description : 'Voir plus'}
          </span>
        </div>
      </div>
    </div>
  </Link>
);

const DashboardPage: NextPageWithLayout = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="loader">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="pe.g mx-auto max-w-7xl sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="mb-6 overflow-hidden bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                Bienvenue, {user?.firstName} {user?.lastName}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Résumé de votre activité et accès rapides
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Cartes différentes selon le rôle de l'utilisateur */}
            {user?.role === UserRole.CUISINISTE && (
              <>
                <DashboardCard
                  title="Clients"
                  description="Gérer vos clients"
                  icon={
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  }
                  link="/clients"
                  count={0}
                />

                <DashboardCard
                  title="Projets"
                  description="Gérer vos projets"
                  icon={
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  }
                  link="/projects"
                  count={0}
                />

                <DashboardCard
                  title="Prestataires"
                  description="Gérer vos prestataires"
                  icon={
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  }
                  link="/prestataires"
                  count={0}
                />
              </>
            )}

            {user?.role === UserRole.PRESTATAIRE && (
              <>
                <DashboardCard
                  title="Prestations"
                  description="Voir vos prestations"
                  icon={
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  }
                  link="/appointments"
                  count={0}
                />

                <DashboardCard
                  title="Disponibilités"
                  description="Gérer vos disponibilités"
                  icon={
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  }
                  link="/availability"
                  count={0}
                />

                <DashboardCard
                  title="Magasins"
                  description="Vos magasins partenaires"
                  icon={
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  }
                  link="/showrooms"
                  count={0}
                />
              </>
            )}

            {/* Cartes communes à tous les rôles */}
            <DashboardCard
              title="Calendrier"
              description="Voir votre agenda"
              icon={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
              link="/calendar"
            />

            <DashboardCard
              title="Profil"
              description="Gérer votre profil"
              icon={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
              link="/profile"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Définir le layout pour cette page
DashboardPage.getLayout = (page: React.ReactElement) => (
  <DashboardLayout title="Tableau de bord">{page}</DashboardLayout>
);

export default DashboardPage;
