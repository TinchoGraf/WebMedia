/** Sirve las fotos guardadas en disco (modo local, sin Vercel Blob). En producción con Blob esta ruta no se usa. */
import { CLAVE_VALIDA, leerLocal } from "@/lib/storage";

export async function GET(_req: Request, { params }: { params: Promise<{ clave: string[] }> }) {
  const clave = (await params).clave.join("/");
  if (!CLAVE_VALIDA.test(clave)) return new Response("No encontrado", { status: 404 });
  const datos = await leerLocal(clave);
  if (!datos) return new Response("No encontrado", { status: 404 });
  return new Response(new Uint8Array(datos), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
