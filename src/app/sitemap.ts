import type { MetadataRoute } from "next";
import { perfilActivo } from "@config";
import { db } from "@/db";
import { rubro } from "@/rubros";
import { sitemap as lista } from "@/server/lecturas";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const r = rubro(perfilActivo().rubro);
  const items = await lista(db, r);
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/${r.ruta}`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contacto`, priority: 0.5 },
    ...items.map((i) => ({ url: `${base}/${r.ruta}/${i.slug}`, lastModified: i.actualizadoEn, priority: 0.8 })),
  ];
}
