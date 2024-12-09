import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the route is /tasks
  if (request.nextUrl.pathname.startsWith('/tasks')) {
    const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
    
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/tasks/:path*',
};
