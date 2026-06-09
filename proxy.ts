import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rotas administrativas - TEMPORARIAMENTE DESATIVADO PARA DEBUG
  // if (pathname.startsWith('/admin')) {
  //   const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
  //                 request.cookies.get('token')?.value;

  //   if (!token) {
  //     // Redirecionar para login se não houver token
  //     const loginUrl = new URL('/login', request.url);
  //     loginUrl.searchParams.set('redirect', pathname);
  //     return NextResponse.redirect(loginUrl);
  //   }

  //   const decoded = verifyToken(token);
    
  //   if (!decoded || decoded.role !== 'admin') {
  //     // Redirecionar para home se não for admin
  //     return NextResponse.redirect(new URL('/', request.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
