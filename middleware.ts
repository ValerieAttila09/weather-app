import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Routes yang boleh diakses tanpa auth
  const publicRoutes = [
    '/landing',
    '/docs',
    '/about',
    '/source',
    '/auth/login',
    '/auth/register',
    '/api/auth',
    '/api/weather',
    '/api/geocoding',
  ];

  // Cek apakah route public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Untuk "/" (weather app) dan "/settings", cek session
  if (pathname === '/' || pathname.startsWith('/settings')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
    });

    if (!token) {
      // Redirect ke login jika tidak authenticated
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
