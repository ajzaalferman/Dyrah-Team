import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession, decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    // 1. Update session expiration (rolling session)
    const response = await updateSession(request);

    // 2. Check auth
    const sessionCookie = request.cookies.get('session');
    let session = null;
    if (sessionCookie) {
        try {
            session = await decrypt(sessionCookie.value);
        } catch (e) {
            // Invalid session
        }
    }

    const path = request.nextUrl.pathname;
    const isProtected = path.startsWith('/admin') || path.startsWith('/employee');

    if (isProtected && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role Protection
    if (path.startsWith('/admin') && session?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/employee', request.url));
    }

    if (path.startsWith('/employee') && session?.role !== 'EMPLOYEE') {
        // Allow admins to view employee view? Or strict separation?
        // Strict for now
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Redirect logged in users away from login
    if (path === '/login' && session) {
        if (session.role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
        return NextResponse.redirect(new URL('/employee', request.url));
    }

    return response || NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest).*)'],
};
