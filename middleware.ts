import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Ambil data session dari cookie
  const session = request.cookies.get('admin_session');
  
  // Tentukan rute mana saja yang ingin diproteksi
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');

  // JIKA mencoba masuk ke /admin TAPI tidak punya cookie session
  if (isAdminPage && !session) {
    // Tendang balik ke halaman login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Konfigurasi agar middleware hanya berjalan di rute admin
export const config = {
  matcher: '/admin/:path*',
};