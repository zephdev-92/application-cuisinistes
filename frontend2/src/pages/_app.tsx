import { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/auth.context';
import '../styles/globals.css';

type PageWithLayout = {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

function MyApp({
  Component,
  pageProps,
}: AppProps & { Component: PageWithLayout }) {
  const getLayout = Component.getLayout || (page => page);

  return <AuthProvider>{getLayout(<Component {...pageProps} />)}</AuthProvider>;
}

export default MyApp;
