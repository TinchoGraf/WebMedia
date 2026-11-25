/**
 * Filtros del listado público. Los filtros viven en la URL (?tipo=camioneta&anio_min=2018) para que se puedan
 * compartir por WhatsApp y Google los indexe. Todo valor se valida contra la definición del rubro:
 * lo que no está en la lista blanca se descarta en silencio, nunca llega a la base.
 */
import { and, asc, desc, eq, gte, ilike, inArray, lte, sql, type SQL } from "drizzle-orm";
import type { DefinicionRubro } from "../rubros/define-rubro";
import { publicaciones } from "../db/schema";

export const POR_PAGINA = 12;

type Params = Record<string, string | string[] | undefined>;

export type FiltroAtributo =
  | { clave: string; modo: "igual"; valor: string }
  | { clave: string; modo: "rango"; min?: number; max?: number }
  | { clave: string; modo: "minimo"; min: number }
  | { clave: string; modo: "si" };

export type Filtros = {
  operacion?: string;
  tipo?: string;
  zona?: string;
  q?: string;
  precioMin?: number;
  precioMax?: number;
  atributos: FiltroAtributo[];
  orden: string;
  pagina: number;
};

const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

function numero(v: string | undefined, min: number, max: number) {
  if (!v || !/^\d{1,12}$/.test(v.replace(/\./g, ""))) return undefined;
  const n = Number(v.replace(/\./g, ""));
  return n >= min && n <= max ? n : undefined;
}

export function parsearFiltros(params: Params, r: DefinicionRubro): Filtros {
  const enLista = (v: string | undefined, lista: { valor: string }[]) => (v && lista.some((o) => o.valor === v) ? v : undefined);

  const f: Filtros = {
    operacion: enLista(uno(params.operacion), r.operaciones),
    tipo: enLista(uno(params.tipo), r.tipos),
    zona: r.usaZona && r.zonas?.includes(uno(params.zona) ?? "") ? uno(params.zona) : undefined,
    q: uno(params.q)?.slice(0, 60),
    precioMin: numero(uno(params.precio_min), 0, 1e12),
    precioMax: numero(uno(params.precio_max), 0, 1e12),
    atributos: [],
    orden: enLista(uno(params.orden), r.ordenes) ?? r.ordenes[0].valor,
    pagina: numero(uno(params.pagina), 1, 1000) ?? 1,
  };

  for (const c of r.campos) {
    if (!("filtro" in c) || !c.filtro) continue;
    if (c.filtro === "igual") {
      const v = uno(params[c.clave]);
      if (!v) continue;
      if (c.tipo === "opcion" && !c.opciones.some((o) => o.valor === v)) continue;
      if (c.tipo === "texto" && v.length > c.max) continue;
      f.atributos.push({ clave: c.clave, modo: "igual", valor: v });
    } else if (c.filtro === "rango" && (c.tipo === "entero" || c.tipo === "decimal")) {
      const min = numero(uno(params[`${c.clave}_min`]), c.min, c.max);
      const max = numero(uno(params[`${c.clave}_max`]), c.min, c.max);
      if (min !== undefined || max !== undefined) f.atributos.push({ clave: c.clave, modo: "rango", min, max });
    } else if (c.filtro === "minimo" && (c.tipo === "entero" || c.tipo === "decimal")) {
      const min = numero(uno(params[c.clave]), c.min, c.max);
      if (min !== undefined) f.atributos.push({ clave: c.clave, modo: "minimo", min });
    } else if (c.filtro === "si") {
      if (uno(params[c.clave]) === "1") f.atributos.push({ clave: c.clave, modo: "si" });
    }
  }
  return f;
}

/** Inversa de parsearFiltros: arma la query string (para links de paginación y "quitar filtro"). */
export function filtrosAParams(f: Filtros, cambios: Partial<Record<string, string | undefined>> = {}): string {
  const p = new URLSearchParams();
  if (f.operacion) p.set("operacion", f.operacion);
  if (f.tipo) p.set("tipo", f.tipo);
  if (f.zona) p.set("zona", f.zona);
  if (f.q) p.set("q", f.q);
  if (f.precioMin !== undefined) p.set("precio_min", String(f.precioMin));
  if (f.precioMax !== undefined) p.set("precio_max", String(f.precioMax));
  for (const a of f.atributos) {
    if (a.modo === "igual") p.set(a.clave, a.valor);
    if (a.modo === "rango") {
      if (a.min !== undefined) p.set(`${a.clave}_min`, String(a.min));
      if (a.max !== undefined) p.set(`${a.clave}_max`, String(a.max));
    }
    if (a.modo === "minimo") p.set(a.clave, String(a.min));
    if (a.modo === "si") p.set(a.clave, "1");
  }
  if (f.orden) p.set("orden", f.orden);
  for (const [k, v] of Object.entries(cambios)) {
    if (v === undefined || v === "") p.delete(k);
    else p.set(k, v);
  }
  if (!("pagina" in cambios)) p.delete("pagina");
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Escapa % y _ para que ILIKE los tome literales */
const escaparLike = (s: string) => s.replace(/[\\%_]/g, (m) => `\\${m}`);

export function condiciones(f: Filtros, r: DefinicionRubro): SQL[] {
  const p = publicaciones;
  const c: (SQL | undefined)[] = [
    eq(p.rubro, r.id),
    inArray(p.estado, ["publicada", "reservada"]),
    f.operacion ? eq(p.operacion, f.operacion) : undefined,
    f.tipo ? eq(p.tipo, f.tipo) : undefined,
    f.zona ? eq(p.zona, f.zona) : undefined,
    f.q ? ilike(p.titulo, `%${escaparLike(f.q)}%`) : undefined,
  ];
  if (f.precioMin !== undefined || f.precioMax !== undefined) {
    c.push(eq(p.moneda, r.moneda(f.operacion ?? null)));
    if (f.precioMin !== undefined) c.push(gte(p.precio, f.precioMin * 100));
    if (f.precioMax !== undefined) c.push(lte(p.precio, f.precioMax * 100));
  }
  for (const a of f.atributos) {
    // La clave viaja como parámetro ($n), no se concatena: aunque viene de la lista blanca, doble seguro.
    const num = sql`(${p.atributos}->>${a.clave})::numeric`;
    if (a.modo === "igual") c.push(sql`${p.atributos} @> ${JSON.stringify({ [a.clave]: a.valor })}::jsonb`);
    if (a.modo === "si") c.push(sql`${p.atributos} @> ${JSON.stringify({ [a.clave]: true })}::jsonb`);
    if (a.modo === "minimo") c.push(sql`${num} >= ${a.min}`);
    if (a.modo === "rango") {
      if (a.min !== undefined) c.push(sql`${num} >= ${a.min}`);
      if (a.max !== undefined) c.push(sql`${num} <= ${a.max}`);
    }
  }
  return c.filter((x): x is SQL => !!x);
}

export function ordenSql(orden: string) {
  const p = publicaciones;
  switch (orden) {
    case "precio-asc": return [sql`${p.precio} ASC NULLS LAST`, desc(p.publicadoEn)];
    case "precio-desc": return [sql`${p.precio} DESC NULLS LAST`, desc(p.publicadoEn)];
    case "km-asc": return [sql`(${p.atributos}->>'km')::numeric ASC NULLS LAST`, desc(p.publicadoEn)];
    case "anio-desc": return [sql`(${p.atributos}->>'anio')::numeric DESC NULLS LAST`, desc(p.publicadoEn)];
    case "m2-desc": return [sql`(${p.atributos}->>'m2Totales')::numeric DESC NULLS LAST`, desc(p.publicadoEn)];
    default: return [desc(p.destacada), desc(p.publicadoEn), asc(p.numero)];
  }
}

export const donde = (f: Filtros, r: DefinicionRubro) => and(...condiciones(f, r));
