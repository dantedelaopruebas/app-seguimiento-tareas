import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware ultra-rápido: comprueba presencia de la cookie de sesión de
 * Supabase SIN hacer viaje a la red. El JWT está firmado por Supabase y se
 * valida cuando una acción/server component realmente lo necesita.
 *
 * Esto cambia ~200ms por navegación a <5ms.
 */
export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isLoginPath = path.startsWith("/login");

  // Supabase guarda la sesión en cookies con prefijo "sb-" y sufijo "-auth-token".
  const hasAuthCookie = req.cookies.getAll().some((c) => {
    const n = c.name;
    return n.startsWith("sb-") && (n.endsWith("-auth-token") || n.endsWith("-auth-token.0"));
  });

  if (!hasAuthCookie && !isLoginPath) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (hasAuthCookie && isLoginPath) {
    const url = req.nextUrl.clone();
    url.pathname = "/today";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
