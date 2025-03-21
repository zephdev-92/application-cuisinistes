import { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/auth.context';
import '@/styles/globals.css';
import { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';

// Types pour la compatibilité de layout avec Next.js
export type NextPageWithLayout<P = object> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Utiliser le layout personnalisé si disponible, sinon utiliser le layout par défaut
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <AuthProvider>
      {getLayout(<Component {...pageProps} />)}
    </AuthProvider>
  );
}

export default MyApp;


