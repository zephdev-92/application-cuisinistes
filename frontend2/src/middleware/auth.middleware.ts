import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Récupérer le token dans les cookies
  const token = request.cookies.get('token')?.value;

  // URL actuelle
  const { pathname } = request.nextUrl;

  // Routes protégées (nécessitant une authentification)
  const protectedRoutes = [
    '/dashboard',
    '/clients',
    '/projects',
    '/appointments',
    '/profile',
    '/showrooms',
  ];

  // Routes d'authentification (accessibles uniquement si non connecté)
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];

  // Vérifier si l'URL actuelle est une route protégée
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Vérifier si l'URL actuelle est une route d'authentification
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  // Si l'utilisateur n'est pas connecté et tente d'accéder à une route protégée
  if (!token && isProtectedRoute) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Si l'utilisateur est connecté et tente d'accéder à une route d'authentification
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Continuer pour les autres routes
  return NextResponse.next();
}

// Configuration des routes à vérifier par le middleware
export const config = {
  matcher: [
    /*
     * Match toutes les routes protégées et routes d'authentification
     * Ne pas vérifier les routes API, fichiers statiques, favicon, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
