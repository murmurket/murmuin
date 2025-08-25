// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 보호가 필요한 경로
  const protectedRoutes = ['/history', '/profile'];

  const pathname = req.nextUrl.pathname;
  const needsAuth = protectedRoutes.some((route) => pathname.startsWith(route));

  if (needsAuth && !session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// ✅ 해당 경로에 대해서만 middleware 적용
export const config = {
  matcher: ['/history', '/profile'],
};