import { NextResponse } from 'next/server';

export async function middleware(request) {
	const { pathname } = request.nextUrl;

	console.log(`Middleware executado para: ${pathname}`);

	// Rotas públicas que não precisam de autenticação
	const publicRoutes = ['/', '/login', '/register'];
	const isApiRoute = pathname.startsWith('/api/');
	const isStaticFile = pathname.startsWith('/_next/') || pathname.startsWith('/favicon') || pathname.includes('.');

	if (publicRoutes.includes(pathname) || isApiRoute || isStaticFile) {
		return NextResponse.next();
	}

	const sessionToken = request.cookies.get('__Secure-session_token')?.value;


	if (!sessionToken) {
		const response = NextResponse.redirect(new URL('/login', request.url));

		response.cookies.set('__Secure-session_token', '', { expires: new Date(0), path: '/' });
		response.cookies.set('auth_session', '', { expires: new Date(0), path: '/' });

		return response;
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Não incluir:
		 * - api routes (/api/*)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - arquivos com extensão
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
	],
};