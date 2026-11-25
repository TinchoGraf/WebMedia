/**
 * Corre antes de cada página:
 *  1. Genera un nonce por request y arma la Content-Security-Policy: solo se ejecutan scripts propios con ese nonce.
 *  2. Si se entra a /panel sin cookie de sesión, redirige al login. OJO: es solo comodidad. La barrera real
 *     es la verificación de sesión y rol dentro de cada página y cada Server Action.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/panel") && pathname !== "/panel/login" && !getSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/panel/login";
    url.search = `?volver=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    // Estilos inline permitidos (los usan librerías de UI); los scripts inline NO.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    process.env.BETTER_AUTH_URL?.startsWith("https://") ? "upgrade-insecure-requests" : "",
  ].filter(Boolean).join("; ");

  const headers = new Headers(req.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const res = NextResponse.next({ request: { headers } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|media|favicon.svg|og.png).*)",
      missing: [{ type: "header", key: "next-router-prefetch" }, { type: "header", key: "purpose", value: "prefetch" }],
    },
  ],
};
