/** Reinicio nocturno del modo demo. Lo llama Vercel Cron (ver vercel.json) con Authorization: Bearer CRON_SECRET. */
import { timingSafeEqual } from "node:crypto";
import { perfilActivo } from "@config";
import { db } from "@/db";
import { reiniciarDemo } from "@/server/demo";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function autorizado(req: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return false;
  const recibido = Buffer.from(req.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${secreto}`);
  return recibido.length === esperado.length && timingSafeEqual(recibido, esperado);
}

export async function GET(req: Request) {
  if (!autorizado(req)) return new Response("No autorizado", { status: 401 });
  await reiniciarDemo(db, perfilActivo().rubro);
  return Response.json({ ok: true, en: new Date().toISOString() });
}
