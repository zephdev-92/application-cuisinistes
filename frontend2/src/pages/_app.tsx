import { useEffect } from 'react';
import { AuthProvider } from '../contexts/auth.context';
import { AppProps } from 'next/app';
import router from 'next/router';
import '@/styles/globals.css';

const isProtectedRoute = (path: string): boolean => {
  const protectedPaths = ['/dashboard', '/clients', '/profile'];
  return protectedPaths.some(protectedPath => path.startsWith(protectedPath));
};

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const path = router.pathname;

      if (!token && isProtectedRoute(path)) {
        // Cette ligne cause le problème
        router.push(`/auth/login?redirectTo=${encodeURIComponent(path)}`);
      }
    };

    checkAuth();
  }, [router]);
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
