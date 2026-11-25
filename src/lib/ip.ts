import { headers } from "next/headers";
/** IP del visitante según el proxy de Vercel (primer valor de x-forwarded-for). Solo se usa hasheada. */
export async function ipCliente() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}
