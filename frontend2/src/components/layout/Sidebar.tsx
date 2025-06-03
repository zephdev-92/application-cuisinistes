import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth, UserRole } from '@/contexts/auth.context';

const Sidebar = () => {
  const router = useRouter();
  const { user } = useAuth();

  // Navigation commune
  const commonNavigation = [
    { name: 'Tableau de bord', href: '/dashboard' },
    { name: 'Calendrier', href: '/calendar' },
    { name: 'Profil', href: '/profile' },
  ];

  // Navigation spécifique au rôle
  const roleSpecificNavigation = {
    [UserRole.VENDEUR]: [
      { name: 'Clients', href: '/clients' },
      { name: 'Projets', href: '/projects' },
      { name: 'Prestataires', href: '/prestataires' },
      { name: 'Magasins', href: '/showrooms' },
    ],
    [UserRole.PRESTATAIRE]: [
      { name: 'Prestations', href: '/appointments' },
      { name: 'Disponibilités', href: '/availability' },
      { name: 'Magasins partenaires', href: '/showrooms' },
    ],
    [UserRole.ADMIN]: [
      { name: 'Utilisateurs', href: '/admin/users' },
      { name: 'Magasins', href: '/admin/showrooms' },
      { name: 'Types de prestations', href: '/admin/service-types' },
      { name: 'Paramètres', href: '/admin/settings' },
    ],
  };

  // Combinaison de la navigation
  const navigation = user
    ? [...commonNavigation, ...(roleSpecificNavigation[user.role] || [])]
    : commonNavigation;

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 flex-shrink-0 items-center border-b border-gray-200 bg-white px-4">
          <Link href="/" className="flex items-center">
            <div className="mr-2 h-8 w-8 rounded-full bg-blue-600"></div>
            <span className="text-lg font-semibold text-gray-900">Gestion Vendeurs</span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  router.pathname === item.href || router.pathname.startsWith(`${item.href}/`)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center rounded-md px-2 py-2 text-sm font-medium`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
