import ProtectedRoute from '../../components/ProtectedRoute';
import ClientsPage from '../../components/clients/ClientsPage';

const ClientsIndexPage = () => {
  return (
    <ProtectedRoute>
      <ClientsPage />
    </ProtectedRoute>
  );
};

export default ClientsIndexPage;
