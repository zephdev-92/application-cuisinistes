import { useAuth } from '@/contexts/auth.context';

interface HeaderProps {
  title?: string;
}

const Header = ({ title }: HeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-semibold text-gray-900">{title || 'Gestion Cuisinistes'}</h1>
        <div className="flex items-center">
          <span className="mr-4 text-gray-700">
            {user ? `${user.firstName} ${user.lastName}` : 'Invité'}
          </span>
          <button
            onClick={() => logout()}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
